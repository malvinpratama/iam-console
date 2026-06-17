import "server-only";

import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";

// The access token lives ONLY on the encrypted, httpOnly NextAuth JWT cookie and
// is deliberately kept out of the client-facing session object (see the session
// callback in auth.ts). These helpers read it server-side so client JS — and
// therefore any XSS — can never reach it via /api/auth/session.

type SessionToken = {
  accessToken?: string;
  backend?: string;
  error?: string;
};

export async function sessionToken(): Promise<SessionToken | null> {
  // Cookie name carries the __Secure- prefix only when served over https.
  const secureCookie = (process.env.AUTH_URL ?? "").startsWith("https://");
  const token = await getToken({
    req: { headers: await headers() },
    secret: process.env.AUTH_SECRET as string,
    secureCookie,
  });
  return (token as SessionToken | null) ?? null;
}

/** The active tenant id, decoded from the (server-held) access token. Display
 * only — the gateway remains the source of truth for tenant scoping. */
export async function activeTenantId(): Promise<string | undefined> {
  const t = await sessionToken();
  if (!t?.accessToken) return undefined;
  try {
    const payload = t.accessToken.split(".")[1];
    const json = JSON.parse(Buffer.from(payload, "base64url").toString());
    return json.tenant_id as string | undefined;
  } catch {
    return undefined;
  }
}
