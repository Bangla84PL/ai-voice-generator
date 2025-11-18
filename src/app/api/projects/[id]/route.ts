/**
 * Project Details API Route
 * GET /api/projects/[id] - Get project details
 * PATCH /api/projects/[id] - Update project
 * DELETE /api/projects/[id] - Delete project
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  handleSupabaseError,
  handleZodError,
  addRateLimitHeaders,
} from '@/lib/api/utils'
import { getCurrentUser } from '@/lib/supabase/server'

export const runtime = 'edge'

interface RouteParams {
  params: {
    id: string
  }
}

// Validation schema for project update
const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  settings: z
    .object({
      defaultVoiceId: z.string().uuid().optional(),
      defaultSpeed: z.number().min(0.25).max(4.0).optional(),
      defaultFormat: z.enum(['mp3', 'wav', 'ogg', 'flac']).optional(),
    })
    .nullable()
    .optional(),
})

/**
 * GET /api/projects/[id]
 * Returns project details with generation count
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

    // Fetch project
    const { data: project, error } = await supabase
      .from('voicegen_projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Project not found', 'NOT_FOUND', 404)
      }
      return handleSupabaseError(error)
    }

    // Get generation count
    const { count } = await supabase
      .from('voicegen_generations')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', id)

    const response = successResponse({
      ...project,
      generation_count: count || 0,
    })

    return addRateLimitHeaders(response)
  } catch (error) {
    console.error('Error fetching project:', error)
    return errorResponse('Failed to fetch project', 'FETCH_ERROR', 500)
  }
}

/**
 * PATCH /api/projects/[id]
 * Updates project details
 */
export async function PATCH(
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

    // Parse and validate request body
    const body = await request.json()
    const validation = updateProjectSchema.safeParse(body)

    if (!validation.success) {
      return handleZodError(validation.error)
    }

    const updates = validation.data

    // Check if project exists and belongs to user
    const { data: existing, error: checkError } = await supabase
      .from('voicegen_projects')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existing) {
      return errorResponse('Project not found', 'NOT_FOUND', 404)
    }

    // Update project
    const { data, error } = await supabase
      .from('voicegen_projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return handleSupabaseError(error)
    }

    const response = successResponse(data)
    return addRateLimitHeaders(response)
  } catch (error) {
    console.error('Error updating project:', error)
    return errorResponse('Failed to update project', 'UPDATE_ERROR', 500)
  }
}

/**
 * DELETE /api/projects/[id]
 * Deletes a project and all associated generations
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

    // Check if project exists and belongs to user
    const { data: project, error: checkError } = await supabase
      .from('voicegen_projects')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !project) {
      return errorResponse('Project not found', 'NOT_FOUND', 404)
    }

    // Delete project (generations will be cascade deleted or set to null based on schema)
    const { error } = await supabase
      .from('voicegen_projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return handleSupabaseError(error)
    }

    const response = successResponse({ message: 'Project deleted successfully' })
    return addRateLimitHeaders(response)
  } catch (error) {
    console.error('Error deleting project:', error)
    return errorResponse('Failed to delete project', 'DELETE_ERROR', 500)
  }
}
