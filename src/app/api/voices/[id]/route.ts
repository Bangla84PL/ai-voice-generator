/**
 * Voice Details API Route
 * GET /api/voices/[id] - Get single voice details
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  handleSupabaseError,
  addRateLimitHeaders,
} from '@/lib/api/utils'

export const runtime = 'edge'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/voices/[id]
 * Returns details for a specific voice
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = createClient()
    const { id } = params

    // Fetch voice details
    const { data, error } = await supabase
      .from('voicegen_voices')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Voice not found', 'NOT_FOUND', 404)
      }
      return handleSupabaseError(error)
    }

    const response = successResponse(data)
    return addRateLimitHeaders(response)
  } catch (error) {
    console.error('Error fetching voice:', error)
    return errorResponse('Failed to fetch voice', 'FETCH_ERROR', 500)
  }
}
