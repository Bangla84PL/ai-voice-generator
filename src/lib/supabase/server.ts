/**
 * Supabase Server Client
 * For use in Server Components, Server Actions, and API Routes
 * Handles cookies properly for authentication
 */

import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase client for server-side usage in Server Components and Server Actions
 * Automatically handles cookie-based authentication
 *
 * @example Server Component
 * ```tsx
 * import { createClient } from '@/lib/supabase/server'
 *
 * export default async function Page() {
 *   const supabase = createClient()
 *
 *   const { data: voices } = await supabase
 *     .from('voicegen_voices')
 *     .select('*')
 *     .eq('is_active', true)
 *
 *   return <div>{voices?.map(v => v.name)}</div>
 * }
 * ```
 *
 * @example Server Action
 * ```tsx
 * 'use server'
 *
 * import { createClient } from '@/lib/supabase/server'
 *
 * export async function createProject(formData: FormData) {
 *   const supabase = createClient()
 *
 *   const { data, error } = await supabase
 *     .from('voicegen_projects')
 *     .insert({
 *       name: formData.get('name') as string,
 *       user_id: (await supabase.auth.getUser()).data.user?.id!
 *     })
 *
 *   return { data, error }
 * }
 * ```
 */
export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Gets the current authenticated user on the server
 * Returns null if not authenticated
 *
 * @example
 * ```tsx
 * const user = await getCurrentUser()
 * if (!user) {
 *   redirect('/login')
 * }
 * ```
 */
export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Gets the current session on the server
 * Returns null if not authenticated
 *
 * @example
 * ```tsx
 * const session = await getSession()
 * if (!session) {
 *   redirect('/login')
 * }
 * ```
 */
export async function getSession() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

/**
 * Gets the current user's profile from voicegen_users table
 * Returns null if not authenticated or profile doesn't exist
 *
 * @example
 * ```tsx
 * const profile = await getUserProfile()
 * if (profile) {
 *   console.log('Credits:', profile.credits_balance)
 *   console.log('Role:', profile.role)
 * }
 * ```
 */
export async function getUserProfile() {
  const supabase = createClient()
  const user = await getCurrentUser()

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

/**
 * Requires authentication, redirects to login if not authenticated
 * Use this in Server Components to protect routes
 *
 * @example
 * ```tsx
 * import { requireAuth } from '@/lib/supabase/server'
 *
 * export default async function ProtectedPage() {
 *   const user = await requireAuth()
 *   // User is guaranteed to be authenticated here
 *
 *   return <div>Hello {user.email}</div>
 * }
 * ```
 */
export async function requireAuth() {
  const { redirect } = await import('next/navigation')
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * Checks if user has a specific role
 *
 * @example
 * ```tsx
 * const isAdmin = await hasRole('admin')
 * if (!isAdmin) {
 *   return <div>Access denied</div>
 * }
 * ```
 */
export async function hasRole(
  role: 'user' | 'pro' | 'enterprise' | 'admin'
): Promise<boolean> {
  const profile = await getUserProfile()
  return profile?.role === role || profile?.role === 'admin'
}

/**
 * Type-safe table access helper
 */
export type SupabaseServer = ReturnType<typeof createClient>
