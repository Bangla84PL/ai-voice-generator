/**
 * Next.js Middleware
 * Handles authentication, session refresh, and protected routes
 *
 * This middleware runs before every request to check authentication
 * and redirect users to appropriate pages based on their auth status.
 */

import { middleware as supabaseMiddleware } from '@/lib/supabase/middleware'

export { middlewareMatcher as config } from '@/lib/supabase/middleware'

export async function middleware(request: any) {
  return await supabaseMiddleware(request)
}
