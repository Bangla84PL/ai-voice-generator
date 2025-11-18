/**
 * Generation Details API Route
 * GET /api/generate/[id] - Get generation status
 * DELETE /api/generate/[id] - Cancel/delete generation
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

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/generate/[id]
 * Returns status and details of a generation
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = createClient()
    const user = await getCurrentUser()

    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const { id } = params

    // Fetch generation with voice details
    const { data, error } = await supabase
      .from('voicegen_generations')
      .select(`
        *,
        voice:voicegen_voices(*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Generation not found', 'NOT_FOUND', 404)
      }
      return handleSupabaseError(error)
    }

    const response = successResponse(data)
    return addRateLimitHeaders(response)
  } catch (error) {
    console.error('Error fetching generation:', error)
    return errorResponse('Failed to fetch generation', 'FETCH_ERROR', 500)
  }
}

/**
 * DELETE /api/generate/[id]
 * Cancels or deletes a generation
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const supabase = createClient()
    const user = await getCurrentUser()

    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const { id } = params

    // Check if generation exists and belongs to user
    const { data: generation, error: fetchError } = await supabase
      .from('voicegen_generations')
      .select('status, credits_used, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !generation) {
      return errorResponse('Generation not found', 'NOT_FOUND', 404)
    }

    // Can only delete pending or failed generations
    if (!['pending', 'failed'].includes(generation.status)) {
      return errorResponse(
        'Can only delete pending or failed generations',
        'INVALID_STATUS',
        400
      )
    }

    // Delete generation
    const { error: deleteError } = await supabase
      .from('voicegen_generations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      return handleSupabaseError(deleteError)
    }

    // Refund credits if generation was pending
    if (generation.status === 'pending') {
      await supabase.rpc('add_user_credits', {
        p_user_id: user.id,
        p_amount: generation.credits_used,
      })

      await supabase.from('voicegen_credits').insert({
        user_id: user.id,
        amount: generation.credits_used,
        type: 'refund',
        description: 'Refund for cancelled generation',
        reference_id: id,
      })
    }

    const response = successResponse({ message: 'Generation deleted successfully' })
    return addRateLimitHeaders(response)
  } catch (error) {
    console.error('Error deleting generation:', error)
    return errorResponse('Failed to delete generation', 'DELETE_ERROR', 500)
  }
}
