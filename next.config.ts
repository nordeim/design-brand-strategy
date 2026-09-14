import type { NextConfig } from "next";

// Security header contract. Emitted by the app itself so the hardening
// travels with the deployment (edge proxy optional, not required).
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // 'unsafe-inline' stays: Next's RSC payload + the inline theme script
      // require it (see ADR notes in AGENTS.md — do not tighten without
      // re-testing hydration). The cloudflareinsights origin is allowed
      // because the deployment host (Cloudflare) injects its Web Analytics
      // beacon into every page; without the allowance the beacon is blocked
      // by the policy (live console error, analytics dead). If the host or
      // its analytics ever changes, keep this list in sync.
      "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
