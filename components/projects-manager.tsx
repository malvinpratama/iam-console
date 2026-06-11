"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProjectAct } from "@/app/(app)/tenant-actions";
import type { Project } from "@/lib/iam";

export function ProjectsManager({ projects, canWrite }: { projects: Project[]; canWrite: boolean }) {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function create() {
    if (!slug || !name) return;
    setBusy(true);
    setMsg(null);
    const r = await createProjectAct(slug.trim(), name.trim());
    setBusy(false);
    if (r.ok) {
      setSlug("");
      setName("");
      setMsg({ kind: "ok", text: "project created" });
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
          <h2 className="font-display text-lg font-bold text-text">New project</h2>
          <p className="mt-1 text-xs text-text-dim">Created in your currently active tenant.</p>
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
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-5 py-8 text-center text-text-dim">
                  No projects in this tenant.
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3 font-semibold text-text">{p.name}</td>
                  <td className="mono px-5 py-3 text-text-dim">{p.slug}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
