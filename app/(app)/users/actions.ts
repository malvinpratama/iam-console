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

// ── Per-user role assignments (scoped to the active tenant + optional project) ──

import { iamGet, type RoleAssignmentsResponse, type RoleAssignment } from "@/lib/iam";

export async function getUserRolesAct(
  userId: string,
): Promise<{ ok: boolean; assignments?: RoleAssignment[]; error?: string }> {
  try {
    const r = await iamGet<RoleAssignmentsResponse>(`/users/${userId}/roles`);
    return { ok: true, assignments: r.assignments };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// Assign a role to a user; projectId empty = tenant-wide, set = scoped to it.
export async function assignRoleScopedAct(
  userId: string,
  role: string,
  projectId: string,
): Promise<Result> {
  try {
    await iamSend("POST", `/users/${userId}/roles`, { role, project_id: projectId });
    revalidatePath("/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// Revoke a specific assignment (projectId empty = the tenant-wide one).
export async function revokeRoleScopedAct(
  userId: string,
  role: string,
  projectId: string,
): Promise<Result> {
  try {
    const q = projectId ? `?project_id=${encodeURIComponent(projectId)}` : "";
    await iamSend("DELETE", `/users/${userId}/roles/${encodeURIComponent(role)}${q}`);
    revalidatePath("/users");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
