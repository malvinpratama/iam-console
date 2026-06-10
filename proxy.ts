import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Protect the app area; everything under /(app) requires a session.
export default auth((req) => {
  const protectedPrefixes = ["/dashboard", "/users", "/roles", "/audit"];
  const needsAuth = protectedPrefixes.some((p) => req.nextUrl.pathname.startsWith(p));
  if (needsAuth && !req.auth) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/users/:path*", "/roles/:path*", "/audit/:path*"],
};
