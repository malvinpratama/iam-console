"use server";

import { iamSend } from "@/lib/iam";

export type EnrollResult =
  | { ok: true; secret: string; otpauth_uri: string; recovery_codes: string[] }
  | { ok: false; error: string };

export async function enroll2fa(): Promise<EnrollResult> {
  try {
    const r = await iamSend<{ secret: string; otpauth_uri: string; recovery_codes: string[] }>(
      "POST",
      "/auth/2fa/enroll",
    );
    return { ok: true, ...r };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function activate2fa(code: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await iamSend("POST", "/auth/2fa/activate", { code });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function disable2fa(code: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await iamSend("POST", "/auth/2fa/disable", { code });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
