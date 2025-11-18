/**
 * Credits Balance API Route
 * GET /api/credits/balance - Get user's current credit balance
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  handleSupabaseError,
  addRateLimitHeaders,
} from '@/lib/api/utils'
import { getCurrentUser } from '@/lib/supabase/server'

export const runtime = 'edge'

/**
 * GET /api/credits/balance
 * Returns current credit balance and usage statistics
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const user = await getCurrentUser()

    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    // Get user profile with credit balance
    const { data: profile, error: profileError } = await supabase
      .from('voicegen_users')
      .select('credits_balance, role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return handleSupabaseError(profileError)
    }

    // Get usage statistics for current month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: monthlyUsage } = await supabase
      .from('voicegen_credits')
      .select('amount')
      .eq('user_id', user.id)
      .eq('type', 'generation')
      .gte('created_at', startOfMonth.toISOString())

    const monthlyCreditsUsed = Math.abs(
      monthlyUsage?.reduce((sum, record) => sum + record.amount, 0) || 0
    )

    // Get total generations this month
    const { count: monthlyGenerations } = await supabase
      .from('voicegen_generations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())

    const response = successResponse({
      balance: profile.credits_balance,
      role: profile.role,
      monthly: {
        creditsUsed: monthlyCreditsUsed,
        generationsCount: monthlyGenerations || 0,
      },
    })

    return addRateLimitHeaders(response)
  } catch (error) {
    console.error('Error fetching credit balance:', error)
    return errorResponse('Failed to fetch credit balance', 'FETCH_ERROR', 500)
  }
}
