/**
 * Public routes that don't require authentication
 */
export const publicRoutes = ['/', '/privacy', '/tos', '/contact'];

/**
 * Routes that are used for authentication
 * These routes will redirect logged in users to /dashboard
 */
export const authRoutes = ['/signin', '/register', '/error', '/profile'];

/**
 * API routes that don't require authentication
 * Routes that start with this prefix are considered API routes
 */
export const apiAuthPrefix = '/api/auth';

/**
 * API routes that are publicly accessible
 * These routes don't require authentication
 */
export const publicApiRoutes = [
  '/api/users', // GET requests to fetch user data
  '/api/contact', // POST requests for contact form
];

/**
 * The default redirect path after logging in
 */
export const DEFAULT_LOGIN_REDIRECT = '/';
