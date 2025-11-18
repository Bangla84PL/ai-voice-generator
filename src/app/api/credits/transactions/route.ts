/**
 * Credit Transactions API Route
 * GET /api/credits/transactions - Get user's credit transaction history
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  handleSupabaseError,
  getPaginationParams,
  addRateLimitHeaders,
} from '@/lib/api/utils'
import { getCurrentUser } from '@/lib/supabase/server'

export const runtime = 'edge'

/**
 * GET /api/credits/transactions
 * Returns paginated credit transaction history
 *
 * Query params:
 * - type: Filter by transaction type (purchase, subscription, generation, refund, bonus)
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 20, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const user = await getCurrentUser()

    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const { page, limit, offset } = getPaginationParams(searchParams)

    // Build query
    let query = supabase
      .from('voicegen_credits')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Filter by type if specified
    if (type && ['purchase', 'subscription', 'generation', 'refund', 'bonus'].includes(type)) {
      query = query.eq('type', type)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    // Execute query
    const { data, error, count } = await query

    if (error) {
      return handleSupabaseError(error)
    }

    // Calculate running balance (optional enhancement)
    const transactions = data || []

    const response = successResponse(transactions, 200, {
      page,
      limit,
      total: count || 0,
    })

    return addRateLimitHeaders(response)
  } catch (error) {
    console.error('Error fetching credit transactions:', error)
    return errorResponse('Failed to fetch transactions', 'FETCH_ERROR', 500)
  }
}
