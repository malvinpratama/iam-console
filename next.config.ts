import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // self-contained server bundle for the container image
  // A stray lockfile in $HOME makes Next mis-infer the workspace root; pin it
  // here so the standalone output lands at .next/standalone/server.js.
  outputFileTracingRoot: import.meta.dirname,
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
