import { auth } from "@/auth";

const BASE = process.env.IAM_ISSUER ?? "http://localhost:8080";

/** Which backend the console is pointed at (Go or Rust), for display. */
export function backendLabel(): string {
  if (BASE.includes("iam-rust")) return "Rust";
  if (BASE.includes("iam-go")) return "Go";
  return "local";
}

/** Authenticated GET against the gateway REST API using the session token. */
export async function iamGet<T>(path: string): Promise<T> {
  const session = await auth();
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${session?.accessToken ?? ""}` },
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
  const session = await auth();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${session?.accessToken ?? ""}`,
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

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
};
