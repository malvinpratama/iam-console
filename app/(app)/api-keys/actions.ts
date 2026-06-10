"use server";

import { revalidatePath } from "next/cache";
import { iamSend, type ApiKey } from "@/lib/iam";

export type CreateResult =
  | { ok: true; secret: string; key: ApiKey }
  | { ok: false; error: string };

export async function createApiKey(
  name: string,
  scopes: string[],
  ttlSeconds: number,
): Promise<CreateResult> {
  try {
    const r = await iamSend<{ secret: string; key: ApiKey }>("POST", "/api-keys", {
      name,
      scopes,
      ttl_seconds: ttlSeconds,
    });
    revalidatePath("/api-keys");
    return { ok: true, ...r };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function revokeApiKey(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await iamSend("DELETE", `/api-keys/${id}`);
    revalidatePath("/api-keys");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
