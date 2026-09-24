import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token"); 

  const isAuthRoute = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup";
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  // Allow API routes to pass through
  if (isApiRoute) {
    return NextResponse.next();
  }

  // If trying to access protected home route without a session
  if (!sessionCookie && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If already authenticated and trying to access login/signup
  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
