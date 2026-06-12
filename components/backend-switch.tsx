import { signIn } from "@/auth";
import { BACKENDS, type BackendId } from "@/lib/iam";

// Shows the active backend (Go / Rust) and a one-click switch to the other.
// Switching re-authenticates via the other backend's OIDC flow, because a
// session is bound to the backend that issued its token.
export function BackendSwitch({ current }: { current: BackendId }) {
  const other: BackendId = current === "iam" ? "iam-rust" : "iam";
  return (
    <div className="mono text-[0.65rem] uppercase tracking-widest">
      <span className="text-muted">backend · </span>
      <span className="text-accent">{BACKENDS[current].label}</span>
      <form
        action={async () => {
          "use server";
          await signIn(other, { redirectTo: "/dashboard" });
        }}
      >
        <button
          type="submit"
          className="mt-1 text-[0.6rem] lowercase tracking-normal text-muted underline-offset-2 transition-colors hover:text-text hover:underline"
          title={`Re-authenticate via the ${BACKENDS[other].label} backend`}
        >
          switch to {BACKENDS[other].label} →
        </button>
      </form>
    </div>
  );
}
