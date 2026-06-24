import { NextRequest, NextResponse } from 'next/server';
import { fetchAuthSession } from 'aws-amplify/auth/server';
import { runWithAmplifyServerContext } from '@/lib/amplify/server';

/**
 * Next.js Middleware - Route Protection
 *
 * Handles authentication and authorization for protected routes.
 *
 * SECURITY:
 * - fetchAuthSession() performs cryptographic JWT signature verification
 * - Tokens are signed by AWS Cognito with RSA-256 private key
 * - Only Cognito can create valid tokens (attacker cannot forge signatures)
 * - Tokens stored in HTTP-only cookies (JavaScript cannot access/modify)
 * - If token is tampered with, signature verification fails → session.tokens = undefined
 * - Therefore: authenticated = !!session.tokens?.idToken is SECURE
 *
 * Rules:
 * 1. Public routes: /, /login, /register, /api/auth/resolve-username
 * 2. Protected routes: /dashboard/*
 * 3. Authenticated users redirected away from /login, /register
 * 4. Unauthenticated users redirected to /login
 *
 * Note: Role-based redirects (admin vs cashier) handled client-side
 * to avoid token parsing in middleware edge runtime.
 */

// Routes that require authentication
const protectedRoutes = ['/dashboard'];

// Routes that should redirect if authenticated
const authRoutes = ['/login', '/register'];

// Public routes that don't require auth
const publicRoutes = ['/', '/api/auth/resolve-username'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route)) {
    return NextResponse.next();
  }

  // Check authentication status
  const response = NextResponse.next();

  let authenticated = false;
  try {
    const session = await runWithAmplifyServerContext({
      nextServerContext: { request, response },
      operation: (contextSpec) => fetchAuthSession(contextSpec),
    });

    // SECURITY LAYER 1: Check if idToken exists
    // If token was tampered with, fetchAuthSession() returns session.tokens = undefined
    const idToken = session.tokens?.idToken;

    if (!idToken) {
      authenticated = false;
    } else {
      // SECURITY LAYER 2: Validate token structure and claims
      // idToken.payload contains the decoded JWT claims
      const payload = idToken.payload;

      // Verify required custom claims exist (ensures token is from our system)
      const hasRole = !!(payload['custom:role'] &&
                     ['admin', 'cashier'].includes(payload['custom:role'] as string));
      const hasStoreId = !!payload['custom:storeId'];

      // Token is valid if:
      // 1. Signature verified by fetchAuthSession() ✅ (already done)
      // 2. Not expired ✅ (already checked by fetchAuthSession())
      // 3. Has required custom claims ✅ (checking now)
      authenticated = hasRole && hasStoreId;

      // Optional: Log suspicious authentication attempts
      if (!authenticated && idToken) {
        console.warn('Invalid token claims:', {
          hasRole,
          hasStoreId,
          role: payload['custom:role'],
        });
      }
    }
  } catch (error) {
    // Any error (signature verification failed, token expired, etc.) = not authenticated
    console.error('Middleware auth check error:', error);
    authenticated = false;
  }

  // Redirect authenticated users away from auth pages
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (authenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }

  // Protect dashboard routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!authenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
