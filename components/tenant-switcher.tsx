"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { switchTenantAct } from "@/app/(app)/tenant-actions";
import type { Membership } from "@/lib/iam";

/** Read the tenant_id claim out of a JWT access token (no verification — display
 * only; the gateway is the source of truth). */
function tenantOf(token?: string): string | undefined {
  if (!token) return undefined;
  try {
    const p = token.split(".")[1];
    const json = JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/")));
    return json.tenant_id as string | undefined;
  } catch {
    return undefined;
  }
}

export function TenantSwitcher({ memberships }: { memberships: Membership[] }) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (memberships.length === 0) return null;

  const activeId = tenantOf(session?.accessToken);
  const active = memberships.find((m) => m.tenant_id === activeId) ?? memberships[0];

  async function pick(m: Membership) {
    setOpen(false);
    if (m.tenant_id === active.tenant_id || busy) return;
    setBusy(true);
    setErr(null);
    const r = await switchTenantAct(m.tenant_id);
    if (r.ok && r.pair) {
      await update({
        accessToken: r.pair.access_token,
        refreshToken: r.pair.refresh_token,
        expiresAt: Math.floor(Date.now() / 1000) + (r.pair.expires_in ?? 900),
      });
      router.refresh();
    } else {
      setErr(r.error ?? "switch failed");
    }
    setBusy(false);
  }

  return (
    <div ref={ref} className="relative mb-6">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2 text-left transition-colors hover:border-border-strong disabled:opacity-60"
      >
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-surface-2 font-display text-xs font-bold text-accent">
          {(active.tenant_name || active.tenant_slug || "?").charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-semibold text-text">{active.tenant_name}</span>
          <span className="mono block truncate text-[0.6rem] uppercase tracking-widest text-muted">
            {busy ? "switching…" : "organization"}
          </span>
        </span>
        <span className="mono text-muted">⌄</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-border-strong bg-surface shadow-xl">
          {memberships.map((m) => {
            const isActive = m.tenant_id === active.tenant_id;
            return (
              <button
                key={m.tenant_id}
                onClick={() => pick(m)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2 ${
                  isActive ? "text-text" : "text-text-dim"
                }`}
              >
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-surface-2 font-display text-[0.6rem] font-bold text-accent">
                  {(m.tenant_name || m.tenant_slug).charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate">{m.tenant_name}</span>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
              </button>
            );
          })}
        </div>
      )}
      {err && <div className="mono mt-1 text-[0.65rem] text-danger">{err}</div>}
    </div>
  );
}
