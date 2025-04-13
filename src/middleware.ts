import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Simple in-memory cache for onboarding status
// Note: This cache is per-instance and will be cleared on server restart
interface CacheEntry {
  status: boolean;
  timestamp: number;
}
const onboardingCache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 1000; // 1 minute in milliseconds

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  if (
    path === '/' ||
    path.startsWith('/auth') ||
    path === '/terms' ||
    path === '/tos' ||
    path === '/privacy' ||
    path === '/contact' ||
    path.startsWith('/_next') || // Add this to avoid middleware running on Next.js assets
    path.startsWith('/api') // Add this to avoid middleware running on API routes
  ) {
    return NextResponse.next();
  }

  // Get the token using next-auth
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if user is authenticated
  if (!token?.email) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Onboarding paths
  const isOnboardingPath = path.startsWith('/onboarding');

  try {
    // Check if we have a cached onboarding status for this user
    const userId = token.sub || (token.userId as string);
    const now = Date.now();
    let isOnboarded: boolean;

    if (onboardingCache.has(userId) && now - onboardingCache.get(userId)!.timestamp < CACHE_TTL) {
      // Use cached value if it's still fresh
      isOnboarded = onboardingCache.get(userId)!.status;
      console.log('Using cached onboarding status for user:', userId);
    } else {
      // Otherwise fetch from API
      console.log('Fetching onboarding status for user:', userId);
      const baseUrl = request.nextUrl.origin;
      const response = await fetch(`${baseUrl}/api/auth/onboarding-status`, {
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch onboarding status: ${response.status}`);
      }

      const onboardingStatus = await response.json();
      isOnboarded = onboardingStatus.isOnboarded;

      // Cache the result
      onboardingCache.set(userId, {
        status: isOnboarded,
        timestamp: now,
      });
    }

    // If user hasn't completed onboarding and isn't on an onboarding path
    if (!isOnboarded && !isOnboardingPath) {
      return NextResponse.redirect(new URL('/onboarding/step1', request.url));
    }

    // If user has completed onboarding but tries to access onboarding paths
    if (isOnboarded && isOnboardingPath) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch (error) {
    console.error('Error in middleware:', error);

    // Redirect to error page in case of error
    return NextResponse.redirect(
      new URL('/error?message=Failed+to+check+onboarding+status', request.url)
    );
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static files in public directory
     */
    '/((?!_next/static|_next/image|favicon.ico|next.svg|logo.svg|illustration.svg).*)',
  ],
};
