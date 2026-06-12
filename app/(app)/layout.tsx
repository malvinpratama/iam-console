import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import {
  activeIssuer,
  iamGet,
  type BackendId,
  type Identity,
  type Membership,
  type MembershipsResponse,
} from "@/lib/iam";
import { Nav } from "@/components/nav";
import { TenantSwitcher } from "@/components/tenant-switcher";
import { BackendSwitch } from "@/components/backend-switch";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const email = session?.user?.email ?? "—";
  const backend: BackendId = session?.backend === "iam-rust" ? "iam-rust" : "iam";

  // Permissions drive which nav items appear (no point showing a 403).
  let perms: string[] = [];
  let memberships: Membership[] = [];
  try {
    const [me, m] = await Promise.all([
      iamGet<Identity>("/me"),
      iamGet<MembershipsResponse>("/me/memberships").catch(
        () => ({ memberships: [] }) as MembershipsResponse,
      ),
    ]);
    perms = me.permissions ?? [];
    memberships = m.memberships ?? [];
  } catch {
    /* keep nav minimal if /me is unreachable */
  }

  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-[1180px] gap-0 px-5">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border py-7 pr-6 md:flex">
        <div className="mb-9 flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-md border border-border-strong bg-surface font-display text-accent">
            ◆
          </span>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold text-text">IAM Console</div>
            <BackendSwitch current={backend} />
          </div>
        </div>
        <TenantSwitcher memberships={memberships} />
        <Nav perms={perms} />
        <div className="mt-auto border-t border-border pt-4">
          <div className="mono mb-3 truncate text-xs text-text-dim" title={email}>
            {email}
          </div>
          <form
            action={async () => {
              "use server";
              const issuer = await activeIssuer();
              await signOut({ redirect: false });
              const post = process.env.AUTH_URL ?? "/";
              // RP-initiated logout: also end the IAM browser session so the next
              // login re-prompts for credentials (lets you switch accounts).
              redirect(`${issuer}/logout?post_logout_redirect_uri=${encodeURIComponent(post)}`);
            }}
          >
            <button className="w-full rounded-lg border border-border px-3 py-2 text-left text-xs text-text-dim transition-colors hover:border-border-strong hover:text-text">
              Sign out →
            </button>
          </form>
        </div>
      </aside>

      <section className="min-w-0 flex-1 py-7 md:pl-8">{children}</section>
    </div>
  );
}
