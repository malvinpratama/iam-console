"use server";

import { revalidatePath } from "next/cache";
import { iamSend } from "@/lib/iam";

type Result = { ok: boolean; error?: string };

export async function deleteUserAct(id: string, hard: boolean): Promise<Result> {
  try {
    await iamSend("DELETE", `/users/${id}${hard ? "?hard=true" : ""}`);
    revalidatePath("/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function restoreUserAct(id: string): Promise<Result> {
  try {
    await iamSend("POST", `/users/${id}/restore`);
    revalidatePath("/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function bulkAssignAct(
  roleName: string,
  userIds: string[],
): Promise<{ ok: boolean; assigned?: number; failed?: string[]; error?: string }> {
  try {
    const r = await iamSend<{ assigned: number; failed: string[] }>(
      "POST",
      `/roles/${encodeURIComponent(roleName)}/assignments`,
      { user_ids: userIds },
    );
    revalidatePath("/users");
    return { ok: true, assigned: r.assigned, failed: r.failed };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
