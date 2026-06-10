import { iamGet, backendLabel, type UsersResponse } from "@/lib/iam";

export default async function Users() {
  let data: UsersResponse | null = null;
  let error: string | null = null;
  try {
    data = await iamGet<UsersResponse>("/users?page=1&page_size=50");
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <div className="rise">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <div className="mono mb-1 text-xs uppercase tracking-[0.25em] text-muted">Directory</div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-text">Users</h1>
        </div>
        {data && (
          <span className="tag">
            {data.total} total · page {data.page}
          </span>
        )}
      </header>

      {error ? (
        <div className="card p-6 text-sm text-danger">
          Couldn&apos;t load users ({backendLabel()}): <span className="mono">{error}</span>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="mono px-5 py-3 text-[0.65rem] uppercase tracking-widest font-medium">
                  User ID
                </th>
                <th className="mono px-5 py-3 text-[0.65rem] uppercase tracking-widest font-medium">
                  Display name
                </th>
                <th className="mono px-5 py-3 text-[0.65rem] uppercase tracking-widest font-medium">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.profiles.length ? (
                data.profiles.map((p) => (
                  <tr
                    key={p.user_id}
                    className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-2/60"
                  >
                    <td className="mono px-5 py-3 text-text-dim">{p.user_id}</td>
                    <td className="px-5 py-3 text-text">{p.display_name || "—"}</td>
                    <td className="mono px-5 py-3 text-muted">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-sm text-muted">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
