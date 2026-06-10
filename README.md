# iam-console

Admin console for the **IAM** platform — a Next.js (App Router) app that signs in
through the IAM provider's own **OpenID Connect** flow ("Login with iam") and
manages identities over the gateway REST API.

- **Auth:** Auth.js (NextAuth v5) as a **confidential OIDC client** (Authorization
  Code + PKCE) against `iam-go` or `iam-rust` — switch backend via `IAM_ISSUER`.
- **Pages:** dashboard (your identity), users, roles & permissions, audit log.
- **Design:** "Vault" — dark security-console aesthetic (Archivo + IBM Plex).

## Run

```bash
cp .env.example .env.local   # set IAM_ISSUER + AUTH_SECRET (openssl rand -base64 32)
npm install
npm run dev                  # http://localhost:3000
```

The OIDC client `iam-admin-console` is seeded by the auth service; its redirect
URIs include `http://localhost:3000/api/auth/callback/iam`.

## Env
| var | meaning |
|---|---|
| `IAM_ISSUER` | IAM gateway base URL (also the OIDC issuer + REST API) |
| `IAM_CLIENT_ID` / `IAM_CLIENT_SECRET` | the seeded console client |
| `AUTH_SECRET` | Auth.js session secret |
| `AUTH_URL` | public URL of this console |
