/**
 * Supabase Browser Client
 * For use in Client Components and client-side code
 * Uses @supabase/ssr for proper cookie handling
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

let client: ReturnType<typeof createBrowserClient<Database>> | undefined

/**
 * Creates a Supabase client for browser/client-side usage
 * This client is singleton and should be used in Client Components
 *
 * @example
 * ```tsx
 * 'use client'
 *
 * import { createClient } from '@/lib/supabase/client'
 *
 * export function MyComponent() {
 *   const supabase = createClient()
 *
 *   const fetchData = async () => {
 *     const { data, error } = await supabase
 *       .from('voicegen_voices')
 *       .select('*')
 *   }
 *
 *   return <div>...</div>
 * }
 * ```
 */
export function createClient() {
  if (client) {
    return client
  }

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return client
}

/**
 * Gets the current authenticated user
 * Returns null if not authenticated
 *
 * @example
 * ```tsx
 * const user = await getCurrentUser()
 * if (user) {
 *   console.log('Logged in as:', user.email)
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
 * Gets the current session
 * Returns null if not authenticated
 *
 * @example
 * ```tsx
 * const session = await getSession()
 * if (session) {
 *   console.log('Access token:', session.access_token)
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
 * Signs out the current user
 *
 * @example
 * ```tsx
 * await signOut()
 * router.push('/login')
 * ```
 */
export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}

/**
 * Type-safe table access helper
 * Provides autocomplete for table names
 */
export type SupabaseClient = ReturnType<typeof createClient>
