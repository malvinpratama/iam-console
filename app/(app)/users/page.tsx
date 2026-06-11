import { UsersTable } from "@/components/users-table";
import {
  iamGet,
  backendLabel,
  type UsersResponse,
  type RolesResponse,
  type Identity,
} from "@/lib/iam";

export default async function Users() {
  let data: UsersResponse | null = null;
  let roles: string[] = [];
  let perms: string[] = [];
  let error: string | null = null;
  try {
    const [users, rolesRes, me] = await Promise.all([
      iamGet<UsersResponse>("/users"),
      iamGet<RolesResponse>("/roles").catch(() => ({ roles: [] }) as RolesResponse),
      iamGet<Identity>("/me"),
    ]);
    data = users;
    roles = rolesRes.roles.map((r) => r.name);
    perms = me.permissions;
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <div className="rise">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <div className="mono mb-1 text-xs uppercase tracking-[0.25em] text-muted">
            Active tenant
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-text">Users</h1>
        </div>
        {data && <span className="tag">{data.total} in tenant</span>}
      </header>

      {error ? (
        <div className="card p-6 text-sm text-danger">
          Couldn&apos;t load users ({backendLabel()}): <span className="mono">{error}</span>
        </div>
      ) : (
        <UsersTable
          users={data?.profiles ?? []}
          roles={roles}
          canDelete={perms.includes("user:delete")}
          canAssign={perms.includes("role:assign")}
        />
      )}
    </div>
  );
}
