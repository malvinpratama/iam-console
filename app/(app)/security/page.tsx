import { SecurityPanel } from "@/components/security-panel";

export default function Security() {
  return (
    <div className="rise">
      <header className="mb-8">
        <div className="mono mb-1 text-xs uppercase tracking-[0.25em] text-muted">Account</div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-text">
          Two-factor auth
        </h1>
      </header>
      <SecurityPanel />
    </div>
  );
}
