import { describe, expect, it } from "vitest";

import { clientKey, rateLimit } from "./rate-limit";

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
