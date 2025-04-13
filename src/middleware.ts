import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuth = !!token;
  const isOnboarded = token?.isOnboarded;
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isOnboardingPage = request.nextUrl.pathname.startsWith("/onboarding");

  console.log({ isAuth, isOnboarded, isAuthPage });

  // If user is not authenticated and tries to access protected routes
  if (!isAuth && !isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If authenticated user tries to access onboarding but is already onboarded
  if (isAuth && isOnboarded && isOnboardingPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If authenticated user is not onboarded, force them to complete onboarding
  if (isAuth && !isOnboarded && !isOnboardingPage) {
    return NextResponse.redirect(new URL("/onboarding/step1", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
