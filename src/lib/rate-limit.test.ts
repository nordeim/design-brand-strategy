import { describe, expect, it } from "vitest";

import { classifyBurstStatuses, clientKey, rateLimit } from "./rate-limit";

function requestWith(headers: Record<string, string>): Request {
  return new Request("https://example.com/api/contact", { headers });
}

describe("clientKey — edge-safe client identity (AUD-1)", () => {
  it("prefers cf-connecting-ip when present (Cloudflare overwrites it; unforgeable)", () => {
    const request = requestWith({
      "cf-connecting-ip": "203.0.113.9",
      "x-forwarded-for": "198.51.100.7, 203.0.113.9",
    });
    expect(clientKey(request)).toBe("203.0.113.9");
  });

  it("keys on the LAST x-forwarded-for entry (the proxy-appended hop), not a forged first hop", () => {
    const request = requestWith({ "x-forwarded-for": "198.51.100.7, 203.0.113.9" });
    expect(clientKey(request)).toBe("203.0.113.9");
  });

  it("treats a forged multi-hop chain with cf-connecting-ip absent as the final hop", () => {
    const request = requestWith({ "x-forwarded-for": "10.0.0.1, 10.0.0.2, 10.0.0.3" });
    expect(clientKey(request)).toBe("10.0.0.3");
  });

  it("single-hop x-forwarded-for keys on itself (e2e isolation pattern stays valid)", () => {
    const request = requestWith({ "x-forwarded-for": "valid-1770000000000" });
    expect(clientKey(request)).toBe("valid-1770000000000");
  });

  it("falls back to x-real-ip when no forwarded chain exists", () => {
    const request = requestWith({ "x-real-ip": "192.0.2.44" });
    expect(clientKey(request)).toBe("192.0.2.44");
  });

  it("falls back to local when no identity headers exist", () => {
    expect(clientKey(requestWith({}))).toBe("local");
  });

  it("trims whitespace around forwarded hops", () => {
    const request = requestWith({ "x-forwarded-for": "  198.51.100.7 ,  203.0.113.9  " });
    expect(clientKey(request)).toBe("203.0.113.9");
  });

  it("ignores an empty cf-connecting-ip and falls through to the chain", () => {
    const request = requestWith({
      "cf-connecting-ip": "",
      "x-forwarded-for": "198.51.100.7, 203.0.113.9",
    });
    expect(clientKey(request)).toBe("203.0.113.9");
  });
});

describe("rateLimit — bounded sliding window (regression guard)", () => {
  it("allows limit requests then rejects the next within the window", () => {
    const key = `test-allow-${Date.now()}`;
    expect(rateLimit(key, 2, 60_000)).toBe(true);
    expect(rateLimit(key, 2, 60_000)).toBe(true);
    expect(rateLimit(key, 2, 60_000)).toBe(false);
  });

  it("starts a fresh window after resetAt passes", () => {
    const key = `test-window-${Date.now()}`;
    expect(rateLimit(key, 1, -1)).toBe(true); // resetAt already in the past
    expect(rateLimit(key, 1, 60_000)).toBe(true); // new bucket
  });
});

describe("classifyBurstStatuses — live-run environment detection (P4-F1)", () => {
  // The contact e2e burst spec sends limit+1 requests with the SAME spoofed
  // x-forwarded-for and classifies the observed statuses so edge-fronted
  // targets (cf-connecting-ip keying, AUD-1) skip isolation assertions
  // instead of failing. Semantics:
  //   "isolated" — exactly [202 × limit, 429]: per-XFF keying works.
  //   "shared"   — a 429 before the limit-th response (or all 429): every
  //                request landed in one bucket keyed by an unforgeable
  //                edge header (or a pre-burned bucket from an earlier run).
  //   "broken"   — no 429 at all: the limiter never trips (regression).

  it("exact [202×5, 429] sequence classifies as isolated", () => {
    expect(classifyBurstStatuses([202, 202, 202, 202, 202, 429], 5)).toBe("isolated");
  });

  it("early 429 (shared bucket partly pre-consumed by earlier specs) classifies as shared", () => {
    // Live Cloudflare-fronted run: valid+malformed+invalid specs consumed 3
    // of the shared bucket before the burst — [202,202,429,429,429,429].
    expect(classifyBurstStatuses([202, 202, 429, 429, 429, 429], 5)).toBe("shared");
  });

  it("all-429 (pre-burned bucket, e.g. a re-run inside the window) classifies as shared", () => {
    expect(classifyBurstStatuses([429, 429, 429, 429, 429, 429], 5)).toBe("shared");
  });

  it("first-request 429 classifies as shared", () => {
    expect(classifyBurstStatuses([429, 202, 202, 202, 202, 429], 5)).toBe("shared");
  });

  it("no 429 at all classifies as broken (limiter regression)", () => {
    expect(classifyBurstStatuses([202, 202, 202, 202, 202, 202], 5)).toBe("broken");
  });

  it("a non-202 non-429 status before any 429 classifies as broken (unexpected shape)", () => {
    expect(classifyBurstStatuses([500, 202, 429, 429, 429, 429], 5)).toBe("broken");
  });

  it("429 exactly at the limit boundary with earlier non-2xx statuses classifies as shared", () => {
    // e.g. an edge that answered 403 to one request but keyed the rest shared
    expect(classifyBurstStatuses([202, 202, 202, 202, 429, 429], 5)).toBe("shared");
  });

  it("respects the limit argument (limit=2: [202,202,429] is isolated)", () => {
    expect(classifyBurstStatuses([202, 202, 429], 2)).toBe("isolated");
  });

  it("too-short input classifies as broken (cannot conclude)", () => {
    expect(classifyBurstStatuses([202, 202], 5)).toBe("broken");
  });
});
