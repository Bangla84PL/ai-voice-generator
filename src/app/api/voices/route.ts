/**
 * Voices API Route
 * GET /api/voices - List all available voices with filtering
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

export const runtime = 'edge'

/**
 * GET /api/voices
 * Returns list of available voices with optional filtering
 *
 * Query params:
 * - language: Filter by language code (e.g., "en-US")
 * - gender: Filter by gender ("male", "female", "neutral")
 * - provider: Filter by provider ("openai", "elevenlabs", "azure")
 * - age: Filter by age category ("young", "adult", "senior")
 * - premium: Filter premium voices ("true", "false")
 * - search: Search by name or description
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 10, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)

    // Extract filters
    const language = searchParams.get('language')
    const gender = searchParams.get('gender')
    const provider = searchParams.get('provider')
    const age = searchParams.get('age')
    const premium = searchParams.get('premium')
    const search = searchParams.get('search')

    // Pagination
    const { page, limit, offset } = getPaginationParams(searchParams)

    // Build query
    let query = supabase
      .from('voicegen_voices')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('name', { ascending: true })

    // Apply filters
    if (language) {
      query = query.eq('language', language)
    }

    if (gender && ['male', 'female', 'neutral'].includes(gender)) {
      query = query.eq('gender', gender)
    }

    if (provider && ['openai', 'elevenlabs', 'azure'].includes(provider)) {
      query = query.eq('provider', provider)
    }

    if (age && ['young', 'adult', 'senior'].includes(age)) {
      query = query.eq('age', age)
    }

    if (premium === 'true') {
      query = query.eq('is_premium', true)
    } else if (premium === 'false') {
      query = query.eq('is_premium', false)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    // Execute query
    const { data, error, count } = await query

    if (error) {
      return handleSupabaseError(error)
    }

    const response = successResponse(data || [], 200, {
      page,
      limit,
      total: count || 0,
    })

    return addRateLimitHeaders(response)
  } catch (error) {
    console.error('Error fetching voices:', error)
    return errorResponse('Failed to fetch voices', 'FETCH_ERROR', 500)
  }
}
