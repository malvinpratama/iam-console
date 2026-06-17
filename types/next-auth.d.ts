import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    // These token fields are the payload shape accepted by unstable_update() on a
    // tenant switch. They are NOT populated onto the client-facing session (the
    // session callback omits them) — server code reads tokens from lib/token.ts.
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    backend?: string;
    error?: string;
    user?: { id?: string } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    backend?: string;
    error?: string;
  }
}
