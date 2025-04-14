import { NextResponse, type NextRequest } from 'next/server';
import authConfig from './auth.config';
import NextAuth from 'next-auth';

const UNAUTHENTICATED_PATHS = ['/', '/terms', '/tos', '/privacy', '/contact'];

const { auth } = NextAuth(authConfig);
export default auth(async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (
    UNAUTHENTICATED_PATHS.includes(path) ||
    path.startsWith('/auth') ||
    path.startsWith('/_next') ||
    path.startsWith('/api')
  ) {
    return NextResponse.next();
  }
  return NextResponse.next();
});

// export async function middleware(request: NextRequest) {
//   // Get the pathname of the request
//   const path = request.nextUrl.pathname;

//   // Public paths that don't require authentication
//   if (
//     path === '/' ||
//     path.startsWith('/auth') ||
//     path === '/terms' ||
//     path === '/tos' ||
//     path === '/privacy' ||
//     path === '/contact' ||
//     path.startsWith('/_next') || // Add this to avoid middleware running on Next.js assets
//     path.startsWith('/api') // Add this to avoid middleware running on API routes
//   ) {
//     return NextResponse.next();
//   }

//   // Get the token using next-auth
//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET,
//   });

//   // Check if user is authenticated
//   if (!token?.email) {
//     return NextResponse.redirect(new URL('/', request.url));
//   }

//   // Onboarding paths
//   const isOnboardingPath = path.startsWith('/onboarding');
//   const isOnboarded = token.isOnboarded;

//   // If user hasn't completed onboarding and isn't on an onboarding path
//   if (!isOnboarded && !isOnboardingPath) {
//     return NextResponse.redirect(new URL('/onboarding/step1', request.url));
//   }

//   // If user has completed onboarding but tries to access onboarding paths
//   if (isOnboarded && isOnboardingPath) {
//     return NextResponse.redirect(new URL('/', request.url));
//   }

//   return NextResponse.next();
// }
// // Configure which paths the middleware should run on
// export const config = {
//   matcher: [
//     // Match all paths except:
//     // - api routes
//     // - _next/static (static files)
//     // - _next/image (image optimization files)
//     // - favicon.ico (favicon file)
//     // - Static files in public directory
//     '/((?!api|_next/static|_next/image|favicon.ico|next.svg|logo.svg|illustration.svg).*)',
//   ],
// };
