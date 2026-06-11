"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { bulkAssignAct, deleteUserAct } from "@/app/(app)/users/actions";
import { UserRoles } from "@/components/user-roles";
import type { Profile, Project } from "@/lib/iam";

export function UsersTable({
  users,
  roles,
  projects,
  canDelete,
  canAssign,
}: {
  users: Profile[];
  roles: string[];
  projects: Project[];
  canDelete: boolean;
  canAssign: boolean;
}) {
  const [openRoles, setOpenRoles] = useState<string | null>(null);
  const router = useRouter();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [role, setRole] = useState(roles[0] ?? "");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  function toggle(id: string) {
    setSel((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }
  const allSelected = users.length > 0 && sel.size === users.length;

  async function run<T>(p: Promise<T>, okText: string) {
    setBusy(true);
    setMsg(null);
    const r = (await p) as { ok: boolean; error?: string };
    setBusy(false);
    setMsg(r.ok ? { kind: "ok", text: okText } : { kind: "err", text: r.error ?? "failed" });
    setSel(new Set());
    router.refresh();
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-end">
        {canAssign && sel.size > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text outline-none focus:border-accent"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              disabled={busy || !role}
              onClick={() =>
                run(
                  bulkAssignAct(role, [...sel]),
                  `Assigned "${role}" to ${sel.size} user(s).`,
                )
              }
              className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Assign to {sel.size} (tenant-wide)
            </button>
          </div>
        )}
      </div>

      {msg && (
        <div className={`card p-3 text-sm ${msg.kind === "ok" ? "text-accent" : "text-danger"}`}>
          {msg.text}
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              {canAssign && (
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) =>
                      setSel(e.target.checked ? new Set(users.map((u) => u.user_id)) : new Set())
                    }
                  />
                </th>
              )}
              <th className="px-5 py-3 text-[0.65rem] uppercase tracking-widest font-medium">Email</th>
              <th className="px-5 py-3 text-[0.65rem] uppercase tracking-widest font-medium">Display name</th>
              <th className="px-5 py-3 text-[0.65rem] uppercase tracking-widest font-medium">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.length ? (
              users.map((p) => (
                <Fragment key={p.user_id}>
                  <tr className="border-b border-border/60 last:border-0 hover:bg-surface-2/60">
                    {canAssign && (
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={sel.has(p.user_id)} onChange={() => toggle(p.user_id)} />
                      </td>
                    )}
                    <td className="px-5 py-3 font-medium text-text">{p.email || "—"}</td>
                    <td className="px-5 py-3 text-text-dim">{p.display_name || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="mono rounded bg-surface-2 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-accent">
                        {p.status || "active"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setOpenRoles(openRoles === p.user_id ? null : p.user_id)}
                        className="mr-2 rounded-md border border-border px-2.5 py-1 text-xs text-text-dim transition-colors hover:border-accent hover:text-accent"
                      >
                        Roles {openRoles === p.user_id ? "▾" : "▸"}
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => run(deleteUserAct(p.user_id, false), "User soft-deleted.")}
                          disabled={busy}
                          className="rounded-md border border-border px-2.5 py-1 text-xs text-danger transition-colors hover:bg-surface"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                  {openRoles === p.user_id && (
                    <tr>
                      <td colSpan={canAssign ? 5 : 4} className="px-5 pb-4">
                        <UserRoles
                          userId={p.user_id}
                          roles={roles}
                          projects={projects}
                          canAssign={canAssign}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted">
                  No users in this tenant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
