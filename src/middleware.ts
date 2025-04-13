import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Get the token using next-auth
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Public paths that don't require authentication
  if (path === "/" || path.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token?.email) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Get user's onboarding status from API
  const baseUrl = request.nextUrl.origin;
  const onboardingStatus = await fetch(
    `${baseUrl}/api/auth/onboarding-status`,
    {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    }
  ).then((res) => res.json());

  // Onboarding paths
  const isOnboardingPath = path.startsWith("/onboarding");

  // If user hasn't completed onboarding and isn't on an onboarding path
  if (!onboardingStatus.isOnboarded && !isOnboardingPath) {
    return NextResponse.redirect(new URL("/onboarding/step1", request.url));
  }

  // If user has completed onboarding but tries to access onboarding paths
  if (onboardingStatus.isOnboarded && isOnboardingPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
