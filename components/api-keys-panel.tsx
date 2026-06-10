"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createApiKey, revokeApiKey } from "@/app/(app)/api-keys/actions";
import type { ApiKey } from "@/lib/iam";

const btn =
  "rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50";

export function ApiKeysPanel({ keys, perms }: { keys: ApiKey[]; perms: string[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>([]);
  const [ttlDays, setTtlDays] = useState(0);
  const [secret, setSecret] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function toggle(p: string) {
    setScopes((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  }

  async function create() {
    setBusy(true);
    setErr(null);
    setSecret(null);
    const r = await createApiKey(name.trim(), scopes, ttlDays > 0 ? ttlDays * 86400 : 0);
    setBusy(false);
    if (r.ok) {
      setSecret(r.secret);
      setName("");
      setScopes([]);
      router.refresh();
    } else setErr(r.error);
  }

  async function revoke(id: string) {
    await revokeApiKey(id);
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <section className="card p-6">
        <h2 className="font-display text-lg font-bold text-text">Create a key</h2>
        <p className="mt-1 text-sm text-muted">
          Scopes are limited to permissions you hold. The secret is shown once.
        </p>

        {secret && (
          <div className="mt-4 rounded-lg border border-accent/40 bg-surface p-3">
            <div className="mono mb-1 text-xs uppercase tracking-widest text-accent">
              Copy now — shown once
            </div>
            <code className="mono break-all text-sm text-text">{secret}</code>
          </div>
        )}
        {err && <div className="mt-4 text-sm text-danger">{err}</div>}

        <div className="mt-4 grid gap-4">
          <input
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent"
            placeholder="Key name (e.g. ci-pipeline)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div>
            <div className="mono mb-2 text-xs uppercase tracking-widest text-muted">Scopes</div>
            <div className="flex flex-wrap gap-2">
              {perms.length ? (
                perms.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggle(p)}
                    className={`mono rounded-md border px-2.5 py-1 text-xs transition-colors ${
                      scopes.includes(p)
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-text-dim hover:bg-surface"
                    }`}
                  >
                    {p}
                  </button>
                ))
              ) : (
                <span className="text-sm text-muted">No permissions held.</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-text-dim">Expires in</label>
            <input
              type="number"
              min={0}
              className="mono w-20 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent"
              value={ttlDays}
              onChange={(e) => setTtlDays(Number(e.target.value))}
            />
            <span className="text-sm text-muted">days (0 = never)</span>
          </div>
          <div>
            <button className={btn} onClick={create} disabled={busy || !name.trim()}>
              {busy ? "Creating…" : "Create key"}
            </button>
          </div>
        </div>
      </section>

      <section className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="mono px-5 py-3 text-[0.65rem] uppercase tracking-widest font-medium">
                Key id
              </th>
              <th className="mono px-5 py-3 text-[0.65rem] uppercase tracking-widest font-medium">
                Name
              </th>
              <th className="mono px-5 py-3 text-[0.65rem] uppercase tracking-widest font-medium">
                Scopes
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {keys.length ? (
              keys.map((k) => (
                <tr key={k.id} className="border-b border-border/60 last:border-0">
                  <td className="mono px-5 py-3 text-text-dim">{k.id}</td>
                  <td className="px-5 py-3 text-text">{k.name}</td>
                  <td className="mono px-5 py-3 text-xs text-muted">
                    {k.scopes.join(", ") || "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => revoke(k.id)}
                      className="rounded-md border border-border px-2.5 py-1 text-xs text-danger transition-colors hover:bg-surface"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-sm text-muted">
                  No API keys yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
