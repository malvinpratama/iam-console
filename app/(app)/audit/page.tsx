import { iamGet, backendLabel, type AuditResponse } from "@/lib/iam";

export default async function Audit() {
  let data: AuditResponse | null = null;
  let error: string | null = null;
  try {
    data = await iamGet<AuditResponse>("/audit?limit=50");
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <div className="rise">
      <header className="mb-8">
        <div className="mono mb-1 text-xs uppercase tracking-[0.25em] text-muted">Trail</div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-text">Audit log</h1>
      </header>

      {error ? (
        <div className="card p-6 text-sm text-danger">
          Couldn&apos;t load audit log ({backendLabel()}): <span className="mono">{error}</span>
        </div>
      ) : (
        <ol className="card divide-y divide-border/60">
          {data?.events.length ? (
            data.events.map((e) => (
              <li key={e.id} className="flex items-start gap-4 px-5 py-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="mono text-sm text-text">{e.action}</span>
                    {e.target && <span className="mono text-xs text-muted">→ {e.target}</span>}
                  </div>
                  {e.detail && <div className="mt-0.5 text-xs text-text-dim">{e.detail}</div>}
                  <div className="mono mt-1 text-[0.7rem] text-muted">
                    {e.actor_email} · {e.created_at ? new Date(e.created_at).toLocaleString() : ""}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-5 py-10 text-center text-sm text-muted">No audit events.</li>
          )}
        </ol>
      )}
    </div>
  );
}
