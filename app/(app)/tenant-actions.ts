"use server";

import { revalidatePath } from "next/cache";
import { iamSend, type TokenPair } from "@/lib/iam";
import { unstable_update } from "@/auth";

type SwitchResult = { ok: boolean; error?: string };

/** Re-issue the session token bound to another tenant the caller belongs to and
 * adopt it into the JWT server-side — the new token never crosses to the client. */
export async function switchTenantAct(tenantId: string): Promise<SwitchResult> {
  try {
    const pair = await iamSend<TokenPair>("POST", "/auth/switch", { tenant_id: tenantId });
    await unstable_update({
      accessToken: pair.access_token,
      refreshToken: pair.refresh_token,
      expiresAt: Math.floor(Date.now() / 1000) + (pair.expires_in ?? 900),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

type Result = { ok: boolean; error?: string };

async function run(p: Promise<unknown>, path: string): Promise<Result> {
  try {
    await p;
    revalidatePath(path);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function createTenantAct(slug: string, name: string): Promise<Result> {
  return run(iamSend("POST", "/tenants", { slug, name }), "/tenants");
}

export async function createProjectAct(slug: string, name: string): Promise<Result> {
  return run(iamSend("POST", "/projects", { slug, name }), "/projects");
}

export async function addMemberAct(email: string): Promise<Result> {
  return run(iamSend("POST", "/members", { email }), "/members");
}

export async function removeMemberAct(userId: string): Promise<Result> {
  return run(iamSend("DELETE", `/members/${encodeURIComponent(userId)}`), "/members");
}
