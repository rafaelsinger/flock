import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If user is not authenticated, NextAuth will handle the redirect to sign in

    // For authenticated users trying to access the home page, redirect to onboarding
    if (req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/onboarding/step1", req.url));
    }

    // For unauthenticated users trying to access protected routes
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL("/auth/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/",
      error: "/auth/error",
    },
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow public pages
        if (
          req.nextUrl.pathname === "/" ||
          req.nextUrl.pathname === "/auth/error" ||
          req.nextUrl.pathname === "/auth/unauthorized" ||
          req.nextUrl.pathname.startsWith("/api/auth")
        ) {
          return true;
        }
        // Require auth for all other pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api/auth/* (auth endpoints)
     * 2. /_next/* (next.js internals)
     * 3. /static files (favicon, images, etc)
     */
    "/((?!api/auth|_next|favicon\\.ico|logo\\.svg|illustration\\.svg).*)",
  ],
};
