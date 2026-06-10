import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { backendLabel } from "@/lib/iam";

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
          A single console over the IAM platform — sign in via the provider&apos;s own
          OpenID Connect flow (Authorization Code&nbsp;+&nbsp;PKCE), no separate password here.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("iam", { redirectTo: "/dashboard" });
          }}
          className="mt-9"
        >
          <button
            type="submit"
            className="group flex w-full items-center justify-between rounded-xl bg-accent px-5 py-3.5 font-display text-sm font-bold text-[#0a0e14] transition-colors hover:bg-accent-press"
          >
            <span>Login with iam</span>
            <span className="mono text-base transition-transform group-hover:translate-x-1">→</span>
          </button>
        </form>

        <div className="mt-8 flex items-center gap-3 text-xs text-muted">
          <span className="tag">backend · {backendLabel()}</span>
          <span className="mono">OIDC · RS256 · PKCE</span>
        </div>
      </div>
    </main>
  );
}
