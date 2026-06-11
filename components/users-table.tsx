"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bulkAssignAct, deleteUserAct, restoreUserAct } from "@/app/(app)/users/actions";
import type { Profile } from "@/lib/iam";

const tab = (active: boolean) =>
  `rounded-lg px-3 py-1.5 text-sm transition-colors ${
    active ? "bg-surface-2 text-text" : "text-text-dim hover:bg-surface hover:text-text"
  }`;

export function UsersTable({
  users,
  roles,
  deleted,
  canDelete,
  canAssign,
}: {
  users: Profile[];
  roles: string[];
  deleted: boolean;
  canDelete: boolean;
  canAssign: boolean;
}) {
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
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <Link href="/users" className={tab(!deleted)}>
            Active
          </Link>
          <Link href="/users?deleted=true" className={tab(deleted)}>
            Deleted
          </Link>
        </div>
        {canAssign && !deleted && sel.size > 0 && (
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
              Assign to {sel.size}
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
              {canAssign && !deleted && (
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
              <th className="mono px-5 py-3 text-[0.65rem] uppercase tracking-widest font-medium">User ID</th>
              <th className="mono px-5 py-3 text-[0.65rem] uppercase tracking-widest font-medium">Display name</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.length ? (
              users.map((p) => (
                <tr key={p.user_id} className="border-b border-border/60 last:border-0 hover:bg-surface-2/60">
                  {canAssign && !deleted && (
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={sel.has(p.user_id)} onChange={() => toggle(p.user_id)} />
                    </td>
                  )}
                  <td className="mono px-5 py-3 text-text-dim">{p.user_id}</td>
                  <td className="px-5 py-3 text-text">{p.display_name || "—"}</td>
                  <td className="px-5 py-3 text-right">
                    {canDelete &&
                      (deleted ? (
                        <button
                          onClick={() => run(restoreUserAct(p.user_id), "User restored.")}
                          disabled={busy}
                          className="rounded-md border border-border px-2.5 py-1 text-xs text-accent transition-colors hover:bg-surface"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => run(deleteUserAct(p.user_id, false), "User soft-deleted.")}
                          disabled={busy}
                          className="rounded-md border border-border px-2.5 py-1 text-xs text-danger transition-colors hover:bg-surface"
                        >
                          Delete
                        </button>
                      ))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-sm text-muted">
                  {deleted ? "No deleted users." : "No users yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
