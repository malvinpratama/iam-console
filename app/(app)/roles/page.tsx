import { RolesManager } from "@/components/roles-manager";
import {
  iamGet,
  backendLabel,
  type RolesResponse,
  type PermissionsResponse,
  type Identity,
} from "@/lib/iam";

export default async function Roles() {
  let roles: RolesResponse = { roles: [] };
  let allPerms: string[] = [];
  let perms: string[] = [];
  let error: string | null = null;
  try {
    const [r, p, me] = await Promise.all([
      iamGet<RolesResponse>("/roles"),
      iamGet<PermissionsResponse>("/permissions").catch(
        () => ({ permissions: [] }) as PermissionsResponse,
      ),
      iamGet<Identity>("/me"),
    ]);
    roles = r;
    allPerms = p.permissions.map((x) => x.name);
    perms = me.permissions;
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <div className="rise">
      <header className="mb-8">
        <div className="mono mb-1 text-xs uppercase tracking-[0.25em] text-muted">Access model</div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-text">
          Roles &amp; permissions
        </h1>
      </header>

      {error ? (
        <div className="card p-6 text-sm text-danger">
          Couldn&apos;t load roles ({backendLabel()}): <span className="mono">{error}</span>
        </div>
      ) : (
        <RolesManager
          roles={roles.roles}
          allPerms={allPerms}
          canWrite={perms.includes("role:write")}
        />
      )}
    </div>
  );
}
