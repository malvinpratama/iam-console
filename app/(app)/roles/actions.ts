"use server";

import { revalidatePath } from "next/cache";
import { iamSend } from "@/lib/iam";

type Result = { ok: boolean; error?: string };

async function run(p: Promise<unknown>): Promise<Result> {
  try {
    await p;
    revalidatePath("/roles");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function createRoleAct(name: string, description: string): Promise<Result> {
  return run(iamSend("POST", "/roles", { name, description }));
}

export async function deleteRoleAct(name: string): Promise<Result> {
  return run(iamSend("DELETE", `/roles/${encodeURIComponent(name)}`));
}

export async function grantPermAct(role: string, permission: string): Promise<Result> {
  return run(iamSend("POST", `/roles/${encodeURIComponent(role)}/permissions`, { permission }));
}

export async function revokePermAct(role: string, permission: string): Promise<Result> {
  return run(
    iamSend(
      "DELETE",
      `/roles/${encodeURIComponent(role)}/permissions/${encodeURIComponent(permission)}`,
    ),
  );
}
