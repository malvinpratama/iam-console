import { auth } from "@/auth";
import { sessionToken } from "@/lib/token";

// The console can talk to either implementation of the IAM (Go or Rust). The
// chosen backend is bound to the session at login (a token from one backend is
// not valid on the other), so every request resolves its base URL from the
// session's `backend`, not a single env var.
export type BackendId = "iam" | "iam-rust";

export const BACKENDS: Record<BackendId, { label: string; url: string }> = {
  iam: { label: "Go", url: process.env.IAM_ISSUER ?? "http://localhost:8080" },
  "iam-rust": { label: "Rust", url: process.env.IAM_RUST_ISSUER ?? "http://localhost:8081" },
};

function backendId(value: unknown): BackendId {
  return value === "iam-rust" ? "iam-rust" : "iam";
}

/** The session's active backend id (defaults to Go when unset). */
export async function activeBackend(): Promise<BackendId> {
  const session = await auth();
  return backendId(session?.backend);
}

/** Base URL (issuer) of the session's active backend — used for logout etc. */
export async function activeIssuer(): Promise<string> {
  return BACKENDS[await activeBackend()].url;
}

/** Human label for the session's active backend (Go / Rust). */
export async function backendLabel(): Promise<string> {
  return BACKENDS[await activeBackend()].label;
}

/** Authenticated GET against the gateway REST API using the session token. */
export async function iamGet<T>(path: string): Promise<T> {
  const token = await sessionToken();
  const base = BACKENDS[backendId(token?.backend)].url;
  const res = await fetch(`${base}${path}`, {
    headers: { Authorization: `Bearer ${token?.accessToken ?? ""}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

/** Authenticated mutation (POST/DELETE/…) against the gateway REST API. */
export async function iamSend<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = await sessionToken();
  const base = BACKENDS[backendId(token?.backend)].url;
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token?.accessToken ?? ""}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    let msg = `${res.status}`;
    try {
      const j = (await res.json()) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export type ApiKey = {
  id: string;
  name: string;
  scopes: string[];
  created_at?: string;
  expires_at?: string;
  last_used_at?: string;
};
export type ApiKeysResponse = { keys: ApiKey[] };

export type Identity = {
  user_id: string;
  email: string;
  roles: string[];
  permissions: string[];
};

export type Profile = {
  user_id: string;
  display_name?: string;
  bio?: string;
  created_at?: string;
  email?: string; // M6.4c: /users joins members → email comes from the membership
  status?: string;
};

export type UsersResponse = {
  profiles: Profile[];
  total: number;
  page: number;
  page_size: number;
};

export type Role = {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
};
export type RolesResponse = { roles: Role[] };

export type Permission = { id: number; name: string; description?: string };
export type PermissionsResponse = { permissions: Permission[] };

export type AuditEvent = {
  id: number;
  actor_email: string;
  action: string;
  target: string;
  detail: string;
  created_at: string;
};
export type AuditResponse = { events: AuditEvent[] };

// ── Multi-tenant (M6) ───────────────────────────────────────

export type Membership = {
  tenant_id: string;
  tenant_slug: string;
  tenant_name: string;
  status: string;
};
export type MembershipsResponse = { memberships: Membership[] };

export type Tenant = { id: string; slug: string; name: string; status: string };
export type TenantsResponse = { tenants: Tenant[] };

export type Project = { id: string; tenant_id: string; slug: string; name: string };
export type ProjectsResponse = { projects: Project[] };

export type Member = { user_id: string; email: string; status: string };
export type MembersResponse = { members: Member[] };

export type RoleAssignment = { role: string; project_id: string; project_slug: string };
export type RoleAssignmentsResponse = { assignments: RoleAssignment[] };

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
};
