import type { NextConfig } from "next";

// Baseline hardening headers applied to every response. Next's App Router emits
// inline hydration scripts (and dev uses eval for Fast Refresh), so script-src
// allows 'unsafe-inline' (+ 'unsafe-eval' in dev) rather than breaking the app;
// a nonce-based policy would be the stricter follow-up. The framing/sniffing/
// referrer controls below are the higher-value wins here.
const dev = process.env.NODE_ENV !== "production";
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone", // self-contained server bundle for the container image
  // A stray lockfile in $HOME makes Next mis-infer the workspace root; pin it
  // here so the standalone output lands at .next/standalone/server.js.
  outputFileTracingRoot: import.meta.dirname,
  turbopack: { root: import.meta.dirname },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
