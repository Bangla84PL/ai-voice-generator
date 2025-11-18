/**
 * Supabase Middleware for Next.js
 * Handles authentication, session refresh, and protected routes
 *
 * This should be imported in your root middleware.ts file
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase client for middleware with proper cookie handling
 * This client can read and write cookies in the middleware context
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  // This will automatically update the session cookies
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { response, user }
}

/**
 * Configuration for protected routes
 * Routes that require authentication
 */
export const protectedRoutes = [
  '/dashboard',
  '/generate',
  '/projects',
  '/history',
  '/library',
  '/settings',
  '/api/generate',
  '/api/projects',
  '/api/credits',
  '/api/subscriptions',
  '/api/keys',
]

/**
 * Configuration for auth routes
 * Routes that should redirect to dashboard if already authenticated
 */
export const authRoutes = ['/login', '/signup', '/reset-password']

/**
 * Configuration for public routes
 * Routes accessible without authentication
 */
export const publicRoutes = ['/', '/pricing', '/docs', '/api/health']

/**
 * Checks if a route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route))
}

/**
 * Checks if a route is an auth route
 */
export function isAuthRoute(pathname: string): boolean {
  return authRoutes.some((route) => pathname.startsWith(route))
}

/**
 * Checks if a route is public
 */
export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(route))
}

/**
 * Main middleware function to handle authentication and routing
 * Import this in your root middleware.ts file
 *
 * @example middleware.ts
 * ```tsx
 * import { middleware as supabaseMiddleware } from '@/lib/supabase/middleware'
 *
 * export async function middleware(request: NextRequest) {
 *   return await supabaseMiddleware(request)
 * }
 *
 * export const config = {
 *   matcher: [
 *     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
 *   ],
 * }
 * ```
 */
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return response
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute(pathname) && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect unauthenticated users to login for protected routes
  if (isProtectedRoute(pathname) && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    // Preserve the original URL for redirect after login
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

/**
 * Middleware matcher configuration
 * Use this in your middleware.ts config
 *
 * @example
 * ```tsx
 * export const config = {
 *   matcher: middlewareMatcher,
 * }
 * ```
 */
export const middlewareMatcher = [
  /*
   * Match all request paths except for the ones starting with:
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - public files (images, etc.)
   */
  '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
]

/**
 * Helper to check user role in middleware
 * Useful for role-based route protection
 *
 * @example
 * ```tsx
 * const userRole = await getUserRole(request)
 * if (userRole !== 'admin') {
 *   return NextResponse.redirect(new URL('/dashboard', request.url))
 * }
 * ```
 */
export async function getUserRole(request: NextRequest) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('voicegen_users')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role || null
}

/**
 * Helper to get user profile in middleware
 *
 * @example
 * ```tsx
 * const profile = await getUserProfile(request)
 * if (profile?.credits_balance < 100) {
 *   // Show low credit warning
 * }
 * ```
 */
export async function getUserProfile(request: NextRequest) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('voicegen_users')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}
