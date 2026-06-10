import { auth, signOut } from "@/auth";
import { backendLabel } from "@/lib/iam";
import { Nav } from "@/components/nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const email = session?.user?.email ?? "—";

  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-[1180px] gap-0 px-5">
      {/* sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border py-7 pr-6 md:flex">
        <div className="mb-9 flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-md border border-border-strong bg-surface font-display text-accent">
            ◆
          </span>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold text-text">IAM Console</div>
            <div className="mono text-[0.65rem] uppercase tracking-widest text-muted">
              backend · {backendLabel()}
            </div>
          </div>
        </div>
        <Nav />
        <div className="mt-auto border-t border-border pt-4">
          <div className="mono mb-3 truncate text-xs text-text-dim" title={email}>
            {email}
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="w-full rounded-lg border border-border px-3 py-2 text-left text-xs text-text-dim transition-colors hover:border-border-strong hover:text-text">
              Sign out →
            </button>
          </form>
        </div>
      </aside>

      {/* content */}
      <section className="min-w-0 flex-1 py-7 md:pl-8">{children}</section>
    </div>
  );
}
