"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addMemberAct, removeMemberAct } from "@/app/(app)/tenant-actions";
import type { Member } from "@/lib/iam";

export function MembersManager({
  members,
  canWrite,
  selfId,
}: {
  members: Member[];
  canWrite: boolean;
  selfId: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function run(p: Promise<{ ok: boolean; error?: string }>, okText: string) {
    setBusy(true);
    setMsg(null);
    const r = await p;
    setBusy(false);
    setMsg(r.ok ? { kind: "ok", text: okText } : { kind: "err", text: r.error ?? "failed" });
    if (r.ok) router.refresh();
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
          <h2 className="font-display text-lg font-bold text-text">Add member</h2>
          <p className="mt-1 text-xs text-text-dim">
            Enrolls an existing user (by email) into the active tenant.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              className="grow rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={() => {
                if (email) run(addMemberAct(email.trim()), "member added").then(() => setEmail(""));
              }}
              disabled={busy || !email}
              className="rounded-lg border border-accent bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </section>
      )}

      <section className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-3 font-medium text-muted">Email</th>
              <th className="px-5 py-3 font-medium text-muted">Status</th>
              {canWrite && <th className="px-5 py-3" />}
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={canWrite ? 3 : 2} className="px-5 py-8 text-center text-text-dim">
                  No members.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr key={m.user_id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3 font-medium text-text">{m.email}</td>
                  <td className="px-5 py-3">
                    <span className="mono rounded bg-surface-2 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-accent">
                      {m.status}
                    </span>
                  </td>
                  {canWrite && (
                    <td className="px-5 py-3 text-right">
                      {m.user_id !== selfId && (
                        <button
                          onClick={() => run(removeMemberAct(m.user_id), "member removed")}
                          disabled={busy}
                          className="rounded-md border border-border px-2.5 py-1 text-xs text-text-dim transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
