import authConfig from '@/auth.config';
import NextAuth from 'next-auth';
import {
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
  DEFAULT_LOGIN_REDIRECT,
  publicApiRoutes,
} from '@/routes';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicApiRoute = publicApiRoutes.some((route) => nextUrl.pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => nextUrl.pathname === route);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // Check if user is not onboarded and redirect to step0
  if (isLoggedIn && req.auth?.user && req.auth.user.isOnboarded === false) {
    const path = nextUrl.pathname;
    if (path !== '/onboarding/step0' && !path.startsWith('/api/')) {
      return Response.redirect(new URL('/onboarding/step0', nextUrl));
    }
  }

  // Redirect already onboarded users away from onboarding pages
  if (isLoggedIn && req.auth?.user && req.auth.user.isOnboarded === true) {
    if (nextUrl.pathname.startsWith('/onboarding')) {
      return Response.redirect(new URL('/', nextUrl));
    }
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL('/', nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
