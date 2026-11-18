/* eslint-disable node/no-process-env -- dev-only bypass flag; server env validation isn't middleware-safe */
import type { NextRequest } from "next/server";

import { authkit, handleAuthkitHeaders } from "@workos-inc/authkit-nextjs";
import { NextResponse } from "next/server";

function getRedirectUri(request: NextRequest): string {
  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  return `${protocol}://${host}/callback`;
}

export default async function middleware(request: NextRequest) {
  // Local dev bypass (AUTH_BYPASS=1): skip WorkOS entirely; the server-side
  // session resolves the seeded dev user. Never set in production.
  if (process.env.AUTH_BYPASS === "1") {
    return NextResponse.next();
  }

  const { session, headers, authorizationUrl } = await authkit(request, {
    redirectUri: getRedirectUri(request),
  });

  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/chat", "/settings"];

  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute && !session.user && authorizationUrl) {
    return handleAuthkitHeaders(request, headers, { redirect: authorizationUrl });
  }

  return handleAuthkitHeaders(request, headers);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.png$).*)",
  ],
};
