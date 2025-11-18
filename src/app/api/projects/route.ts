/**
 * Projects API Route
 * GET /api/projects - List user projects
 * POST /api/projects - Create new project
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  handleSupabaseError,
  handleZodError,
  getPaginationParams,
  addRateLimitHeaders,
} from '@/lib/api/utils'
import { getCurrentUser } from '@/lib/supabase/server'

export const runtime = 'edge'

// Validation schema for project creation
const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters'),
  description: z.string().max(500).optional(),
  settings: z
    .object({
      defaultVoiceId: z.string().uuid().optional(),
      defaultSpeed: z.number().min(0.25).max(4.0).optional(),
      defaultFormat: z.enum(['mp3', 'wav', 'ogg', 'flac']).optional(),
    })
    .optional(),
})

/**
 * GET /api/projects
 * Returns list of user's projects
 *
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 10, max: 100)
 * - search: Search by name or description
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const user = await getCurrentUser()

    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const { page, limit, offset } = getPaginationParams(searchParams)

    // Build query
    let query = supabase
      .from('voicegen_projects')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    // Apply search filter
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
    console.error('Error fetching projects:', error)
    return errorResponse('Failed to fetch projects', 'FETCH_ERROR', 500)
  }
}

/**
 * POST /api/projects
 * Creates a new project
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const user = await getCurrentUser()

    if (!user) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = createProjectSchema.safeParse(body)

    if (!validation.success) {
      return handleZodError(validation.error)
    }

    const { name, description, settings } = validation.data

    // Create project
    const { data, error } = await supabase
      .from('voicegen_projects')
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        settings: settings || null,
      })
      .select()
      .single()

    if (error) {
      return handleSupabaseError(error)
    }

    const response = successResponse(data, 201)
    return addRateLimitHeaders(response)
  } catch (error) {
    console.error('Error creating project:', error)
    return errorResponse('Failed to create project', 'CREATE_ERROR', 500)
  }
}
