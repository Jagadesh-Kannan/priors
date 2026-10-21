import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: pages and actions still verify the session themselves.
export function proxy(request: NextRequest) {
  if (!request.cookies.has("priors_session")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!login|_next/static|_next/image|sw.js|manifest.webmanifest|favicon.ico|.*\\.png$).*)",
  ],
};
