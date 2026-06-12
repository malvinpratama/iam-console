# iam-console

Admin console for the **IAM** platform — a **Next.js (App Router) + Auth.js** app
that manages identities, access, and tenants over the IAM gateway's REST API.

The IAM is implemented as a **dual stack**: the *same* OIDC/REST API in both **Go**
and **Rust**. This console is the admin UI for both — and can sign in against
either one.

> **Live demo:** https://console.digitalglobalgrowth.com
> Sign in with the read-only demo account `demo@iam.local` / `demo1234` —
> it can read everything and modify nothing.

## Backend switcher

The headline feature. The login page offers two buttons — **"Sign in via Go"** and
**"Sign in via Rust"** — each running the full OIDC flow against that backend. The
chosen backend is **bound to the session at login**: a token issued by one backend
is not valid on the other, and every REST call the console makes goes to the
backend that issued the session's token.

A switch in the sidebar flips to the other backend by **re-authenticating** through
its OIDC flow. Because both stacks implement the identical API, the console behaves
the same against either — a live demonstration that the two implementations are
interchangeable.

## Auth

- OIDC login against the IAM's **own** provider — Authorization Code + PKCE, via
  Auth.js (NextAuth v5) as a confidential client (`client_secret_post`).
- Access/refresh tokens are bound to the session and stored in the JWT.
- Token **rotation** is handled in the `jwt` callback: it reuses a still-valid
  access token, and on expiry refreshes against the **same backend's** `/token`
  endpoint (keeping any rotated refresh token).

See [`auth.ts`](./auth.ts) for the provider config and token lifecycle.

## Pages

| Page | What it does |
|---|---|
| **Dashboard** | Your identity and session overview. |
| **Users** | User directory with per-user role assignment. |
| **Roles & Permissions** | Manage roles and their permissions. |
| **Tenants** | Manage tenants (organizations). |
| **Projects** | Manage projects within a tenant. |
| **Members** | Tenant/project membership, with a tenant + project switcher. |
| **Security** | 2FA (TOTP) enroll/activate/disable + self-service password change. |
| **API Keys** | Create and revoke API keys. |
| **Audit log** | Browse audit events. |

Multi-tenant pages use the sidebar **tenant switcher**, which calls the IAM's
`/auth/switch` endpoint to obtain a tenant-scoped token and adopts it into the
session — no full re-login required.

## Configuration

| Var | Meaning |
|---|---|
| `IAM_ISSUER` | Go backend gateway base URL (OIDC issuer + REST API). Default `http://localhost:8080`. |
| `IAM_RUST_ISSUER` | Rust backend gateway base URL. Default `http://localhost:8081`. |
| `IAM_CLIENT_ID` | OIDC client id for the console. Default `iam-admin-console`. |
| `IAM_CLIENT_SECRET` | Console client secret (Go backend). |
| `IAM_RUST_CLIENT_SECRET` | Console client secret for the Rust backend (falls back to `IAM_CLIENT_SECRET` if both share one). |
| `AUTH_SECRET` | Auth.js session secret (`openssl rand -base64 32`). |
| `AUTH_URL` | Public URL of this console. |

The OIDC client `iam-admin-console` is seeded by the auth service; its redirect
URIs include `http://localhost:3000/api/auth/callback/iam` (and `/callback/iam-rust`).

## Run locally

```bash
cp .env.example .env.local   # set IAM_ISSUER + AUTH_SECRET at minimum
npm install
npm run dev                  # http://localhost:3000
```

```bash
npm run build && npm run start   # production build
```

Point `IAM_ISSUER` at a running IAM gateway (default `http://localhost:8080`); set
`IAM_RUST_ISSUER` too if you want the Rust backend switcher active.

## Related repos

- **Go backend** — https://github.com/malvinpratama/iam-go
- **Rust backend** — https://github.com/malvinpratama/iam-rust
- **GitOps / deploy** — https://github.com/malvinpratama/iam-gitops
