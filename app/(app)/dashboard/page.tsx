import { iamGet, backendLabel, type Identity } from "@/lib/iam";

export default async function Dashboard() {
  let id: Identity | null = null;
  let error: string | null = null;
  try {
    id = await iamGet<Identity>("/me");
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <div className="rise">
      <header className="mb-8">
        <div className="mono mb-1 text-xs uppercase tracking-[0.25em] text-muted">Overview</div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-text">Dashboard</h1>
      </header>

      {error ? (
        <div className="card p-6 text-sm text-danger">
          Couldn&apos;t reach the IAM API ({backendLabel()}): <span className="mono">{error}</span>
        </div>
      ) : id ? (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="Roles" value={id.roles.length} />
            <Stat label="Permissions" value={id.permissions.length} />
            <Stat label="Signed in via" value="OIDC" mono />
          </div>

          <div className="card p-6">
            <div className="mono mb-4 text-xs uppercase tracking-widest text-muted">Identity</div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" value={id.email} />
              <Field label="Subject (sub)" value={id.user_id} mono />
            </dl>
          </div>

          <div className="card p-6">
            <div className="mono mb-4 text-xs uppercase tracking-widest text-muted">Roles</div>
            <div className="flex flex-wrap gap-2">
              {id.roles.length ? (
                id.roles.map((r) => (
                  <span
                    key={r}
                    className="rounded-md border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-xs text-accent"
                  >
                    {r}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted">none</span>
              )}
            </div>
          </div>

          <div className="card p-6">
            <div className="mono mb-4 text-xs uppercase tracking-widest text-muted">
              Permissions
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
              {id.permissions.length ? (
                id.permissions.sort().map((p) => (
                  <span key={p} className="mono text-xs text-text-dim">
                    <span className="text-accent">·</span> {p}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted">none</span>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string | number; mono?: boolean }) {
  return (
    <div className="card p-5">
      <div className="mono text-[0.65rem] uppercase tracking-widest text-muted">{label}</div>
      <div className={`mt-2 text-3xl font-bold text-text ${mono ? "mono text-2xl" : "font-display"}`}>
        {value}
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="mono text-[0.65rem] uppercase tracking-widest text-muted">{label}</dt>
      <dd className={`mt-1 break-all text-sm text-text ${mono ? "mono" : ""}`}>{value}</dd>
    </div>
  );
}
