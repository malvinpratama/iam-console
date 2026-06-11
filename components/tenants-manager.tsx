"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTenantAct } from "@/app/(app)/tenant-actions";
import type { Tenant } from "@/lib/iam";

export function TenantsManager({ tenants, canWrite }: { tenants: Tenant[]; canWrite: boolean }) {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function create() {
    if (!slug || !name) return;
    setBusy(true);
    setMsg(null);
    const r = await createTenantAct(slug.trim(), name.trim());
    setBusy(false);
    if (r.ok) {
      setSlug("");
      setName("");
      setMsg({ kind: "ok", text: "tenant created" });
      router.refresh();
    } else {
      setMsg({ kind: "err", text: r.error ?? "failed" });
    }
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
          <h2 className="font-display text-lg font-bold text-text">New tenant</h2>
          <p className="mt-1 text-xs text-text-dim">
            You become its admin automatically. Switch into it from the sidebar to manage projects
            and members.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent"
              placeholder="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <input
              className="grow rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent"
              placeholder="display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              onClick={create}
              disabled={busy || !slug || !name}
              className="rounded-lg border border-accent bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/20 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </section>
      )}

      <section className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-5 py-3 font-medium text-muted">Name</th>
              <th className="px-5 py-3 font-medium text-muted">Slug</th>
              <th className="px-5 py-3 font-medium text-muted">Status</th>
            </tr>
          </thead>
          <tbody>
            {tenants.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-text-dim">
                  No tenants.
                </td>
              </tr>
            ) : (
              tenants.map((t) => (
                <tr key={t.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3 font-semibold text-text">{t.name}</td>
                  <td className="mono px-5 py-3 text-text-dim">{t.slug}</td>
                  <td className="px-5 py-3">
                    <span className="mono rounded bg-surface-2 px-2 py-0.5 text-[0.65rem] uppercase tracking-wider text-accent">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
