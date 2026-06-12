import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export default async function Login() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="relative z-10 grid min-h-screen place-items-center px-6">
      <div className="rise w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md border border-border-strong bg-surface text-accent">
            <span className="font-display text-lg font-extrabold">◆</span>
          </span>
          <span className="mono text-xs uppercase tracking-[0.3em] text-muted">IAM · Console</span>
        </div>

        <h1 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-text">
          Identity,
          <br />
          <span className="text-accent">access</span> &amp; control.
        </h1>
        <p className="mt-5 max-w-sm text-sm leading-relaxed text-text-dim">
          One console over two interchangeable backends — the same IAM implemented
          in <span className="text-text">Go</span> and <span className="text-text">Rust</span>.
          Pick one to sign in via its OpenID Connect flow (Authorization
          Code&nbsp;+&nbsp;PKCE). Your session is bound to that backend.
        </p>

        <div className="mt-9 space-y-3">
          <form
            action={async () => {
              "use server";
              await signIn("iam", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="group flex w-full items-center justify-between rounded-xl bg-accent px-5 py-3.5 font-display text-sm font-bold text-[#0a0e14] transition-colors hover:bg-accent-press"
            >
              <span>Sign in via <span className="mono">Go</span> backend</span>
              <span className="mono text-base transition-transform group-hover:translate-x-1">→</span>
            </button>
          </form>
          <form
            action={async () => {
              "use server";
              await signIn("iam-rust", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="group flex w-full items-center justify-between rounded-xl border border-border-strong bg-surface px-5 py-3.5 font-display text-sm font-bold text-text transition-colors hover:border-accent hover:text-accent"
            >
              <span>Sign in via <span className="mono">Rust</span> backend</span>
              <span className="mono text-base transition-transform group-hover:translate-x-1">→</span>
            </button>
          </form>
        </div>

        <div className="mt-8 flex items-center gap-3 text-xs text-muted">
          <span className="mono">OIDC · RS256 · PKCE</span>
        </div>
      </div>
    </main>
  );
}
