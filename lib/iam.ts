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

export type AuditEvent = {
  id: number;
  actor_email: string;
  action: string;
  target: string;
  detail: string;
  created_at: string;
};
export type AuditResponse = { events: AuditEvent[] };
