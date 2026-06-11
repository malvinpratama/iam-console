"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { activate2fa, disable2fa, enroll2fa } from "@/app/(app)/security/actions";

const btn =
  "rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-50";
const ghost =
  "rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-dim transition-colors hover:bg-surface disabled:opacity-50";
const input =
  "mono w-40 rounded-lg border border-border bg-surface px-3 py-2 text-sm tracking-widest text-text outline-none focus:border-accent";

export function SecurityPanel() {
  const [enroll, setEnroll] = useState<{
    secret: string;
    otpauth_uri: string;
    recovery_codes: string[];
  } | null>(null);
  const [actCode, setActCode] = useState("");
  const [disCode, setDisCode] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function doEnroll() {
    setBusy(true);
    setMsg(null);
    const r = await enroll2fa();
    setBusy(false);
    if (r.ok) setEnroll(r);
    else setMsg({ kind: "err", text: r.error ?? "failed" });
  }

  async function doActivate() {
    setBusy(true);
    setMsg(null);
    const r = await activate2fa(actCode.trim());
    setBusy(false);
    if (r.ok) {
      setMsg({ kind: "ok", text: "2FA is now active. You'll be asked for a code at every login." });
      setEnroll(null);
      setActCode("");
    } else setMsg({ kind: "err", text: r.error ?? "failed" });
  }

  async function doDisable() {
    setBusy(true);
    setMsg(null);
    const r = await disable2fa(disCode.trim());
    setBusy(false);
    if (r.ok) {
      setMsg({ kind: "ok", text: "2FA disabled." });
      setDisCode("");
    } else setMsg({ kind: "err", text: r.error ?? "failed" });
  }

  return (
    <div className="grid gap-6">
      {msg && (
        <div
          className={`card p-4 text-sm ${msg.kind === "ok" ? "text-accent" : "text-danger"}`}
        >
          {msg.text}
        </div>
      )}

      {/* Enable */}
      <section className="card p-6">
        <h2 className="font-display text-lg font-bold text-text">Enable two-factor auth</h2>
        <p className="mt-1 text-sm text-muted">
          Generate a TOTP secret, add it to an authenticator app, then confirm a code.
        </p>

        {!enroll ? (
          <button className={`${btn} mt-4`} onClick={doEnroll} disabled={busy}>
            {busy ? "Generating…" : "Generate secret"}
          </button>
        ) : (
          <div className="mt-5 grid gap-4">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <div className="rounded-xl bg-white p-3">
                <QRCodeSVG value={enroll.otpauth_uri} size={168} level="M" />
              </div>
              <div className="text-sm text-text-dim">
                <p className="font-medium text-text">Scan with your authenticator app</p>
                <p className="mt-1">
                  Google Authenticator, 1Password, Authy… then enter the 6-digit code below.
                </p>
                <details className="mt-3">
                  <summary className="cursor-pointer text-muted hover:text-text-dim">
                    Can&apos;t scan? Enter the key manually
                  </summary>
                  <code className="mono mt-2 block break-all rounded-lg bg-surface px-3 py-2 text-sm text-text">
                    {enroll.secret}
                  </code>
                </details>
              </div>
            </div>
            <div>
              <div className="mono mb-1 text-xs uppercase tracking-widest text-muted">
                Recovery codes — save these, shown once
              </div>
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface p-3 sm:grid-cols-5">
                {enroll.recovery_codes.map((c) => (
                  <code key={c} className="mono text-xs text-text-dim">
                    {c}
                  </code>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                className={input}
                placeholder="123456"
                value={actCode}
                onChange={(e) => setActCode(e.target.value)}
              />
              <button className={btn} onClick={doActivate} disabled={busy || actCode.length < 6}>
                Activate
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Disable */}
      <section className="card p-6">
        <h2 className="font-display text-lg font-bold text-text">Disable two-factor auth</h2>
        <p className="mt-1 text-sm text-muted">
          Enter a current TOTP or recovery code to turn 2FA off.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <input
            className={input}
            placeholder="123456"
            value={disCode}
            onChange={(e) => setDisCode(e.target.value)}
          />
          <button className={ghost} onClick={doDisable} disabled={busy || disCode.length < 6}>
            Disable
          </button>
        </div>
      </section>
    </div>
  );
}
