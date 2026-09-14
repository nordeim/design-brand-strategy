/**
 * gap-proxy.mjs — replay an upstream HTTP response with a discrete delivery
 * gap (first chunk, pause, remainder). Simulates the Cloudflare edge ->
 * origin streaming behavior that lets Chrome paint a partial HTML document
 * mid-parse (the cold-load CLS trigger measured on the live deploy).
 *
 * Used by scripts/cls-regression.mjs (ADR-012 CLS guard).
 *
 * Usage: bun scripts/gap-proxy.mjs <upstream-port> <proxy-port> [gap-ms] [first-bytes]
 *   e.g. bun scripts/gap-proxy.mjs 3199 3200 300 7000
 */
import http from "node:http";

const UPSTREAM_PORT = Number(process.argv[2] ?? 3199);
const PROXY_PORT = Number(process.argv[3] ?? 3200);
const GAP_MS = Number(process.argv[4] ?? 300);
const FIRST_BYTES = Number(process.argv[5] ?? 7000);

const server = http.createServer(async (req, res) => {
  try {
    const upstream = await fetch(`http://127.0.0.1:${UPSTREAM_PORT}${req.url}`, {
      headers: { accept: req.headers.accept ?? "*/*" },
    });
    const body = Buffer.from(await upstream.arrayBuffer());
    const headers = Object.fromEntries(
      [...upstream.headers.entries()].filter(
        ([k]) => !["content-encoding", "content-length", "transfer-encoding"].includes(k),
      ),
    );
    res.writeHead(upstream.status, headers);
    // First burst: the streamed shell (header + hero + footer).
    res.write(body.subarray(0, FIRST_BYTES));
    // The gap: origin/edge latency between stream chunks.
    await new Promise((r) => setTimeout(r, GAP_MS));
    // Remaining stream: the page content + RSC payload.
    res.end(body.subarray(FIRST_BYTES));
  } catch (e) {
    res.writeHead(502);
    res.end("gap-proxy error: " + e.message);
  }
});

server.listen(PROXY_PORT, "127.0.0.1", () => {
  console.log(`gap-proxy: 127.0.0.1:${PROXY_PORT} -> :${UPSTREAM_PORT} (gap ${GAP_MS}ms after ${FIRST_BYTES}B)`);
});
