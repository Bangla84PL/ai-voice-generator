/**
 * Supabase Admin Client
 * Uses service role key to bypass Row Level Security (RLS)
 * ONLY use for admin operations like credit management, user administration, etc.
 *
 * ⚠️ WARNING: This client bypasses ALL security policies!
 * Only use in trusted server-side code (API routes, Server Actions)
 * NEVER expose this client to the browser!
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

let adminClient: ReturnType<typeof createClient<Database>> | undefined

/**
 * Creates a Supabase admin client with service role privileges
 * This client bypasses Row Level Security (RLS) policies
 *
 * @example API Route - Credit Operations
 * ```tsx
 * import { createAdminClient } from '@/lib/supabase/admin'
 *
 * export async function POST(request: Request) {
 *   const admin = createAdminClient()
 *
 *   // Grant credits to user (bypasses RLS)
 *   const { error } = await admin
 *     .from('voicegen_credits')
 *     .insert({
 *       user_id: userId,
 *       amount: 10000,
 *       type: 'bonus',
 *       description: 'Welcome bonus'
 *     })
 *
 *   return Response.json({ success: !error })
 * }
 * ```
 *
 * @example Server Action - User Management
 * ```tsx
 * 'use server'
 *
 * import { createAdminClient } from '@/lib/supabase/admin'
 *
 * export async function updateUserRole(userId: string, role: string) {
 *   const admin = createAdminClient()
 *
 *   const { error } = await admin
 *     .from('voicegen_users')
 *     .update({ role })
 *     .eq('id', userId)
 *
 *   return { success: !error }
 * }
 * ```
 */
export function createAdminClient() {
  if (adminClient) {
    return adminClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    )
  }

  adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return adminClient
}

/**
 * Updates user's credit balance (admin operation)
 * Adds a credit transaction and updates the user's balance
 *
 * @param userId - User ID to update credits for
 * @param amount - Credit amount (positive to add, negative to subtract)
 * @param type - Type of credit transaction
 * @param description - Description of the transaction
 * @param referenceId - Optional reference ID (e.g., generation_id, subscription_id)
 *
 * @example
 * ```tsx
 * // Grant welcome bonus
 * await updateUserCredits(userId, 10000, 'bonus', 'Welcome bonus')
 *
 * // Deduct credits for generation
 * await updateUserCredits(userId, -500, 'generation', 'Voice generation', generationId)
 * ```
 */
export async function updateUserCredits(
  userId: string,
  amount: number,
  type: 'purchase' | 'subscription' | 'generation' | 'refund' | 'bonus',
  description: string,
  referenceId?: string
) {
  const admin = createAdminClient()

  try {
    // Start a transaction by inserting credit record
    const { error: creditError } = await admin.from('voicegen_credits').insert({
      user_id: userId,
      amount,
      type,
      description,
      reference_id: referenceId || null,
    })

    if (creditError) {
      throw creditError
    }

    // Update user's credit balance
    const { data: currentUser, error: userFetchError } = await admin
      .from('voicegen_users')
      .select('credits_balance')
      .eq('id', userId)
      .single()

    if (userFetchError) {
      throw userFetchError
    }

    const newBalance = (currentUser.credits_balance || 0) + amount

    const { error: updateError } = await admin
      .from('voicegen_users')
      .update({ credits_balance: newBalance })
      .eq('id', userId)

    if (updateError) {
      throw updateError
    }

    return { success: true, newBalance }
  } catch (error) {
    console.error('Error updating user credits:', error)
    return { success: false, error }
  }
}

/**
 * Gets user's current credit balance
 *
 * @example
 * ```tsx
 * const balance = await getUserCredits(userId)
 * console.log('User has', balance, 'credits')
 * ```
 */
export async function getUserCredits(userId: string): Promise<number> {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('voicegen_users')
    .select('credits_balance')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return 0
  }

  return data.credits_balance || 0
}

/**
 * Checks if user has sufficient credits
 *
 * @example
 * ```tsx
 * const hasEnough = await hasSufficientCredits(userId, 500)
 * if (!hasEnough) {
 *   return Response.json({ error: 'Insufficient credits' }, { status: 402 })
 * }
 * ```
 */
export async function hasSufficientCredits(
  userId: string,
  requiredCredits: number
): Promise<boolean> {
  const balance = await getUserCredits(userId)
  return balance >= requiredCredits
}

/**
 * Creates a new user profile in voicegen_users
 * Usually called after user signs up via Supabase Auth
 *
 * @example
 * ```tsx
 * // In auth webhook or signup flow
 * await createUserProfile({
 *   id: user.id,
 *   email: user.email,
 *   full_name: user.user_metadata.full_name,
 *   credits_balance: 10000, // Welcome bonus
 * })
 * ```
 */
export async function createUserProfile(data: {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  credits_balance?: number
}) {
  const admin = createAdminClient()

  const { error } = await admin.from('voicegen_users').insert({
    id: data.id,
    email: data.email,
    full_name: data.full_name || null,
    avatar_url: data.avatar_url || null,
    role: 'user',
    credits_balance: data.credits_balance || 0,
  })

  if (error) {
    console.error('Error creating user profile:', error)
    throw error
  }

  // Grant welcome bonus if credits_balance was provided
  if (data.credits_balance && data.credits_balance > 0) {
    await updateUserCredits(
      data.id,
      data.credits_balance,
      'bonus',
      'Welcome bonus credits'
    )
  }

  return { success: true }
}

/**
 * Updates user's role (admin operation)
 *
 * @example
 * ```tsx
 * await updateUserRole(userId, 'pro')
 * ```
 */
export async function updateUserRole(
  userId: string,
  role: 'user' | 'pro' | 'enterprise' | 'admin'
) {
  const admin = createAdminClient()

  const { error } = await admin
    .from('voicegen_users')
    .update({ role })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user role:', error)
    throw error
  }

  return { success: true }
}

/**
 * Deletes a user and all associated data
 * Cascades to projects, generations, credits, etc.
 *
 * @example
 * ```tsx
 * await deleteUser(userId)
 * ```
 */
export async function deleteUser(userId: string) {
  const admin = createAdminClient()

  // Delete user profile (cascades will handle related records)
  const { error: profileError } = await admin
    .from('voicegen_users')
    .delete()
    .eq('id', userId)

  if (profileError) {
    console.error('Error deleting user profile:', profileError)
    throw profileError
  }

  // Delete auth user
  const { error: authError } = await admin.auth.admin.deleteUser(userId)

  if (authError) {
    console.error('Error deleting auth user:', authError)
    throw authError
  }

  return { success: true }
}

/**
 * Gets all users (admin operation)
 * Use with caution - can return large datasets
 *
 * @param limit - Max number of users to return
 * @param offset - Offset for pagination
 *
 * @example
 * ```tsx
 * const users = await getAllUsers(50, 0)
 * ```
 */
export async function getAllUsers(limit = 50, offset = 0) {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('voicegen_users')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching users:', error)
    throw error
  }

  return data
}

/**
 * Type-safe admin client type
 */
export type SupabaseAdmin = ReturnType<typeof createAdminClient>
