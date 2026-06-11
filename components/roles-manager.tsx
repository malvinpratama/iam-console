"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createRoleAct,
  deleteRoleAct,
  grantPermAct,
  revokePermAct,
} from "@/app/(app)/roles/actions";
import type { Role } from "@/lib/iam";

const builtin = (n: string) => n === "admin" || n === "user";

export function RolesManager({
  roles,
  allPerms,
  canWrite,
}: {
  roles: Role[];
  allPerms: string[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(p: Promise<{ ok: boolean; error?: string }>, okText: string) {
    setBusy(true);
    setMsg(null);
    const r = await p;
    setBusy(false);
    setMsg(r.ok ? { kind: "ok", text: okText } : { kind: "err", text: r.error ?? "failed" });
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      {msg && (
        <div className={`card p-3 text-sm ${msg.kind === "ok" ? "text-accent" : "text-danger"}`}>
          {msg.text}
        </div>
      )}

      {canWrite && (
        <section className="card p-5">
          <h2 className="font-display text-lg font-bold text-text">New role</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent"
              placeholder="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="grow rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent"
              placeholder="description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <button
              disabled={busy || !name.trim()}
              onClick={() =>
                run(createRoleAct(name.trim(), desc.trim()), `Role "${name}" created.`).then(() => {
                  setName("");
                  setDesc("");
                })
              }
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {roles.map((r) => {
          const missing = allPerms.filter((p) => !r.permissions.includes(p));
          return (
            <div key={r.id || r.name} className="card p-5">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold text-text">{r.name}</span>
                <div className="flex items-center gap-2">
                  <span className="tag">{r.permissions.length} perms</span>
                  {canWrite && !builtin(r.name) && (
                    <button
                      onClick={() => run(deleteRoleAct(r.name), `Role "${r.name}" deleted.`)}
                      disabled={busy}
                      className="rounded-md border border-border px-2 py-0.5 text-xs text-danger transition-colors hover:bg-surface"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              {r.description && <p className="mt-1 text-sm text-text-dim">{r.description}</p>}

              <div className="mt-4 flex flex-wrap gap-1.5">
                {[...r.permissions].sort().map((p) => (
                  <span
                    key={p}
                    className="mono group flex items-center gap-1 rounded border border-border-strong px-1.5 py-0.5 text-[0.7rem] text-text-dim"
                  >
                    {p}
                    {canWrite && (
                      <button
                        title="revoke"
                        onClick={() => run(revokePermAct(r.name, p), `Revoked ${p} from ${r.name}.`)}
                        className="text-muted hover:text-danger"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
                {!r.permissions.length && <span className="text-xs text-muted">no permissions</span>}
              </div>

              {canWrite && missing.length > 0 && (
                <div className="mt-3">
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const p = e.target.value;
                      e.currentTarget.value = "";
                      if (p) run(grantPermAct(r.name, p), `Granted ${p} to ${r.name}.`);
                    }}
                    className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-text-dim outline-none focus:border-accent"
                  >
                    <option value="">+ grant permission…</option>
                    {missing.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
