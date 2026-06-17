import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Route guard for the authenticated `(app)` area. The matcher below lists EVERY
// protected segment — a missing entry silently exposes that page's shell. A
// session whose refresh token failed (`RefreshTokenError`) is treated as
// logged-out so the user re-authenticates instead of operating on a dead token.
export default auth((req) => {
  const authed = !!req.auth?.user && req.auth.error !== "RefreshTokenError";
  if (!authed) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  // Keep in sync with the route segments under app/(app). The login page ("/"),
  // NextAuth routes, and static assets are intentionally excluded.
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/members/:path*",
    "/roles/:path*",
    "/projects/:path*",
    "/tenants/:path*",
    "/api-keys/:path*",
    "/audit/:path*",
    "/security/:path*",
  ],
};
