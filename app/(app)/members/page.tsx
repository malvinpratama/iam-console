import { MembersManager } from "@/components/members-manager";
import { iamGet, backendLabel, type MembersResponse, type Identity } from "@/lib/iam";

export default async function Members() {
  let members: MembersResponse = { members: [] };
  let me: Identity | null = null;
  let error: string | null = null;
  try {
    const [m, i] = await Promise.all([
      iamGet<MembersResponse>("/members"),
      iamGet<Identity>("/me"),
    ]);
    members = m;
    me = i;
  } catch (e) {
    error = (e as Error).message;
  }

  return (
    <div className="rise">
      <header className="mb-8">
        <div className="mono mb-1 text-xs uppercase tracking-[0.25em] text-muted">Active tenant</div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-text">Members</h1>
      </header>
      {error ? (
        <div className="card p-6 text-sm text-danger">
          Couldn&apos;t load members ({await backendLabel()}): <span className="mono">{error}</span>
        </div>
      ) : (
        <MembersManager
          members={members.members}
          canWrite={me?.permissions.includes("member:write") ?? false}
          selfId={me?.user_id ?? ""}
        />
      )}
    </div>
  );
}
