import { SecurityPanel } from "@/components/security-panel";
import { iamGet } from "@/lib/iam";

export default async function Security() {
  let enabled = false;
  try {
    enabled = (await iamGet<{ enabled: boolean }>("/auth/2fa")).enabled;
  } catch {
    /* default to the enroll view if status can't be read */
  }
  return (
    <div className="rise">
      <header className="mb-8">
        <div className="mono mb-1 text-xs uppercase tracking-[0.25em] text-muted">Account</div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-text">
          Two-factor auth
        </h1>
      </header>
      <SecurityPanel enabled={enabled} />
    </div>
  );
}
