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
      if (account?.access_token) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      if (session.user) session.user.id = token.sub as string;
      return session;
    },
  },
});
