import { TenantsManager } from "@/components/tenants-manager";
import { iamGet, backendLabel, type TenantsResponse, type Identity } from "@/lib/iam";

export default async function Tenants() {
  let tenants: TenantsResponse = { tenants: [] };
  let perms: string[] = [];
  let error: string | null = null;
  try {
    const [t, me] = await Promise.all([
      iamGet<TenantsResponse>("/tenants"),
      iamGet<Identity>("/me"),
    ]);
    tenants = t;
    perms = me.permissions;
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <div className="rise">
      <header className="mb-8">
        <div className="mono mb-1 text-xs uppercase tracking-[0.25em] text-muted">Organizations</div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-text">Tenants</h1>
      </header>
      {error ? (
        <div className="card p-6 text-sm text-danger">
          Couldn&apos;t load tenants ({backendLabel()}): <span className="mono">{error}</span>
        </div>
      ) : (
        <TenantsManager tenants={tenants.tenants} canWrite={perms.includes("tenant:write")} />
      )}
    </div>
  );
}
