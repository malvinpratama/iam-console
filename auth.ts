import NextAuth from "next-auth";

// IAM is the OIDC issuer (the gateway). Switch backend (Go ↔ Rust) by changing
// IAM_ISSUER. The same base URL also serves the REST API the console consumes.
const issuer = process.env.IAM_ISSUER ?? "http://localhost:8080";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    {
      id: "iam",
      name: "IAM",
      type: "oidc",
      issuer,
      clientId: process.env.IAM_CLIENT_ID ?? "iam-admin-console",
      clientSecret: process.env.IAM_CLIENT_SECRET ?? "console-demo-secret-rotate-me",
      authorization: { params: { scope: "openid profile email" } },
      // Our token endpoint accepts client_secret_post; advertise it explicitly.
      client: { token_endpoint_auth_method: "client_secret_post" },
      // Minimal id_token profile → console identity.
      profile(profile) {
        return { id: profile.sub, email: profile.email, name: profile.email };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in: persist the tokens issued by the provider.
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at; // unix seconds
        token.error = undefined;
        return token;
      }

      // Still valid (30s skew) → reuse the current access token.
      const expiresAt = token.expiresAt as number | undefined;
      if (expiresAt && Date.now() < expiresAt * 1000 - 30_000) {
        return token;
      }

      // Expired → rotate using the refresh token against the IAM token endpoint.
      const refreshToken = token.refreshToken as string | undefined;
      if (!refreshToken) {
        token.error = "RefreshTokenError";
        return token;
      }
      try {
        const res = await fetch(`${issuer}/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: process.env.IAM_CLIENT_ID ?? "iam-admin-console",
            client_secret: process.env.IAM_CLIENT_SECRET ?? "console-demo-secret-rotate-me",
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
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as string | undefined;
      if (session.user) session.user.id = token.sub as string;
      return session;
    },
  },
});
