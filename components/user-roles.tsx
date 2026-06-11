"use client";

import { useEffect, useState } from "react";
import {
  getUserRolesAct,
  assignRoleScopedAct,
  revokeRoleScopedAct,
} from "@/app/(app)/users/actions";
import type { RoleAssignment, Project } from "@/lib/iam";

// A per-user role panel: shows the user's assignments in the active tenant (each
// tagged tenant-wide or with its project) and lets you assign/revoke precisely.
export function UserRoles({
  userId,
  roles,
  projects,
  canAssign,
}: {
  userId: string;
  roles: string[];
  projects: Project[];
  canAssign: boolean;
}) {
  const [items, setItems] = useState<RoleAssignment[] | null>(null);
  const [role, setRole] = useState(roles[0] ?? "");
  const [project, setProject] = useState(""); // "" = tenant-wide
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const r = await getUserRolesAct(userId);
    if (r.ok) setItems(r.assignments ?? []);
    else setErr(r.error ?? "failed to load");
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function run(p: Promise<{ ok: boolean; error?: string }>) {
    setBusy(true);
    setErr(null);
    const r = await p;
    if (!r.ok) setErr(r.error ?? "failed");
    await load();
    setBusy(false);
  }

  const scopeLabel = (a: RoleAssignment) =>
    a.project_slug ? `${a.project_slug}` : "tenant-wide";

  return (
    <div className="rounded-lg border border-border bg-surface/60 p-4">
      {err && <div className="mono mb-2 text-xs text-danger">{err}</div>}

      <div className="mb-3 flex flex-wrap gap-2">
        {items === null ? (
          <span className="text-xs text-muted">loading…</span>
        ) : items.length === 0 ? (
          <span className="text-xs text-muted">No roles in this tenant.</span>
        ) : (
          items.map((a) => (
            <span
              key={`${a.role}:${a.project_id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-surface-2 px-2.5 py-1 text-xs text-text"
            >
              <span className="font-medium">{a.role}</span>
              <span className="text-muted">· {scopeLabel(a)}</span>
              {canAssign && (
                <button
                  title="Revoke"
                  disabled={busy}
                  onClick={() => run(revokeRoleScopedAct(userId, a.role, a.project_id))}
                  className="ml-0.5 text-muted transition-colors hover:text-danger disabled:opacity-50"
                >
                  ×
                </button>
              )}
            </span>
          ))
        )}
      </div>

      {canAssign && (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-text outline-none focus:border-accent"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-text outline-none focus:border-accent"
          >
            <option value="">tenant-wide</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                project: {p.slug}
              </option>
            ))}
          </select>
          <button
            disabled={busy || !role}
            onClick={() => run(assignRoleScopedAct(userId, role, project))}
            className="rounded-lg border border-accent bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
          >
            + Assign
          </button>
        </div>
      )}
    </div>
  );
}
