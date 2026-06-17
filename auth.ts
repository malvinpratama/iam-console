import NextAuth from "next-auth";

// Two interchangeable IAM backends: the Go and Rust implementations of the same
// OIDC/REST API. The user picks one at login; the whole session (tokens + every
// REST call) is bound to that backend, because a token issued by one backend is
// not valid on the other. Switching backend means re-authenticating via the
// other provider. Provider id "iam" = Go (keeps the original /callback/iam URL),
// "iam-rust" = Rust.
type BackendId = "iam" | "iam-rust";

const clientId = process.env.IAM_CLIENT_ID ?? "iam-admin-console";

// The OIDC client secret MUST be provided via env in production — never fall back
// to the well-known demo value, which would let anyone impersonate the console
// client. The fallback exists only for local dev (NODE_ENV !== "production").
function requireSecret(value: string | undefined, who: string): string {
  if (value) return value;
  // Fail at runtime, but not during `next build` (page-data collection runs in
  // production mode without runtime secrets) — that would break CI.
  const building = process.env.NEXT_PHASE === "phase-production-build";
  if (process.env.NODE_ENV === "production" && !building) {
    throw new Error(`${who} must be set in production (refusing to use the demo secret)`);
  }
  return "console-demo-secret-rotate-me";
}

const BACKENDS: Record<BackendId, { name: string; issuer: string; clientSecret: string }> = {
  iam: {
    name: "Go backend",
    issuer: process.env.IAM_ISSUER ?? "http://localhost:8080",
    clientSecret: requireSecret(process.env.IAM_CLIENT_SECRET, "IAM_CLIENT_SECRET"),
  },
  "iam-rust": {
    name: "Rust backend",
    issuer: process.env.IAM_RUST_ISSUER ?? "http://localhost:8081",
    // Falls back to the Go secret if both backends share one console-client secret.
    clientSecret: requireSecret(
      process.env.IAM_RUST_CLIENT_SECRET ?? process.env.IAM_CLIENT_SECRET,
      "IAM_RUST_CLIENT_SECRET / IAM_CLIENT_SECRET",
    ),
  },
};

function backendOf(value: unknown): BackendId {
  return value === "iam-rust" ? "iam-rust" : "iam";
}

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  trustHost: true,
  providers: (Object.keys(BACKENDS) as BackendId[]).map((id) => ({
    id,
    name: BACKENDS[id].name,
    type: "oidc",
    issuer: BACKENDS[id].issuer,
    clientId,
    clientSecret: BACKENDS[id].clientSecret,
    authorization: { params: { scope: "openid profile email" } },
    // Our token endpoint accepts client_secret_post; advertise it explicitly.
    client: { token_endpoint_auth_method: "client_secret_post" },
    // Minimal id_token profile → console identity.
    profile(profile) {
      return { id: profile.sub, email: profile.email, name: profile.email };
    },
  })),
  callbacks: {
    async jwt({ token, account, trigger, session }) {
      // Initial sign-in: persist the tokens + which backend issued them.
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at; // unix seconds
        token.backend = backendOf(account.provider);
        token.error = undefined;
        return token;
      }

      // Tenant switch: the switcher calls update({...}) with the freshly issued
      // pair from POST /auth/switch — adopt it as the session's active token.
      // The backend is unchanged (you can't switch tenant across backends).
      if (trigger === "update" && session?.accessToken) {
        token.accessToken = session.accessToken as string;
        if (session.refreshToken) token.refreshToken = session.refreshToken as string;
        token.expiresAt = session.expiresAt as number;
        token.error = undefined;
        return token;
      }

      // Still valid (30s skew) → reuse the current access token.
      const expiresAt = token.expiresAt as number | undefined;
      if (expiresAt && Date.now() < expiresAt * 1000 - 30_000) {
        return token;
      }

      // Expired → rotate against the SAME backend's token endpoint.
      const refreshToken = token.refreshToken as string | undefined;
      if (!refreshToken) {
        token.error = "RefreshTokenError";
        return token;
      }
      const cfg = BACKENDS[backendOf(token.backend)];
      try {
        const res = await fetch(`${cfg.issuer}/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: cfg.clientSecret,
          }),
          cache: "no-store",
        });
        const refreshed = (await res.json()) as {
          access_token?: string;
          refresh_token?: string;
          expires_in?: number;
        };
        if (!res.ok || !refreshed.access_token) throw new Error("refresh failed");
        token.accessToken = refreshed.access_token;
        token.expiresAt = Math.floor(Date.now() / 1000) + (refreshed.expires_in ?? 900);
        // The IAM rotates refresh tokens — keep the newest if returned.
        if (refreshed.refresh_token) token.refreshToken = refreshed.refresh_token;
        token.error = undefined;
      } catch {
        token.error = "RefreshTokenError";
      }
      return token;
    },
    async session({ session, token }) {
      // NB: the access token is intentionally NOT copied onto the session — it
      // must never reach client JS (/api/auth/session). Server code reads it
      // from the JWT cookie via lib/token.ts. `backend`/`error` are non-secret.
      session.backend = token.backend as string | undefined;
      session.error = token.error as string | undefined;
      if (session.user) session.user.id = token.sub as string;
      return session;
    },
  },
});
