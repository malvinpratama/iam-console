import { iamGet, backendLabel, type RolesResponse } from "@/lib/iam";

export default async function Roles() {
  let data: RolesResponse | null = null;
  let error: string | null = null;
  try {
    data = await iamGet<RolesResponse>("/roles");
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
        <div className="grid gap-4 sm:grid-cols-2">
          {data?.roles.map((r) => (
            <div key={r.id || r.name} className="card p-5">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold text-text">{r.name}</span>
                <span className="tag">{r.permissions.length} perms</span>
              </div>
              {r.description && (
                <p className="mt-1 text-sm text-text-dim">{r.description}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {r.permissions.sort().map((p) => (
                  <span
                    key={p}
                    className="mono rounded border border-border-strong px-1.5 py-0.5 text-[0.7rem] text-text-dim"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
