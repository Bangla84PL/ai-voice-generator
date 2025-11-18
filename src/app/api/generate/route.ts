/**
 * Generate Voice API Route
 * POST /api/generate - Create a new voice generation
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
  checkCredits,
  deductCredits,
  calculateCredits,
} from '@/lib/api/utils'
import { getCurrentUser } from '@/lib/supabase/server'

export const runtime = 'nodejs' // OpenAI requires nodejs runtime

// Validation schema
const generateSchema = z.object({
  text: z
    .string()
    .min(1, 'Text is required')
    .max(5000, 'Text must be less than 5000 characters'),
  voice_id: z.string().uuid('Invalid voice ID'),
  project_id: z.string().uuid('Invalid project ID').optional(),
  settings: z
    .object({
      speed: z.number().min(0.25).max(4.0).optional(),
      pitch: z.number().min(-20).max(20).optional(),
      volume: z.number().min(0).max(100).optional(),
      format: z.enum(['mp3', 'wav', 'ogg', 'flac']).optional(),
    })
    .optional(),
})

/**
 * POST /api/generate
 * Creates a new voice generation task
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
    const validation = generateSchema.safeParse(body)

    if (!validation.success) {
      return handleZodError(validation.error)
    }

    const { text, voice_id, project_id, settings } = validation.data

    // Check if voice exists and is active
    const { data: voice, error: voiceError } = await supabase
      .from('voicegen_voices')
      .select('*')
      .eq('id', voice_id)
      .eq('is_active', true)
      .single()

    if (voiceError || !voice) {
      return errorResponse('Voice not found or inactive', 'VOICE_NOT_FOUND', 404)
    }

    // Check if user has premium access for premium voices
    if (voice.is_premium) {
      const { data: userProfile } = await supabase
        .from('voicegen_users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!userProfile || !['pro', 'enterprise', 'admin'].includes(userProfile.role)) {
        return errorResponse(
          'Premium voice requires Pro or Enterprise subscription',
          'PREMIUM_REQUIRED',
          403
        )
      }
    }

    // Validate project ownership if project_id provided
    if (project_id) {
      const { data: project, error: projectError } = await supabase
        .from('voicegen_projects')
        .select('id')
        .eq('id', project_id)
        .eq('user_id', user.id)
        .single()

      if (projectError || !project) {
        return errorResponse(
          'Project not found or access denied',
          'PROJECT_NOT_FOUND',
          404
        )
      }
    }

    // Calculate credits needed
    const characterCount = text.length
    const creditsNeeded = calculateCredits(characterCount)

    // Check user has sufficient credits
    const hasCredits = await checkCredits(user.id, creditsNeeded, supabase)
    if (!hasCredits) {
      return errorResponse(
        `Insufficient credits. Need ${creditsNeeded} credits.`,
        'INSUFFICIENT_CREDITS',
        402
      )
    }

    // Create generation record
    const { data: generation, error: createError } = await supabase
      .from('voicegen_generations')
      .insert({
        user_id: user.id,
        project_id: project_id || null,
        text,
        character_count: characterCount,
        voice_id,
        settings: settings || null,
        status: 'pending',
        credits_used: creditsNeeded,
      })
      .select()
      .single()

    if (createError) {
      return handleSupabaseError(createError)
    }

    // Deduct credits
    await deductCredits(
      user.id,
      creditsNeeded,
      `Voice generation - ${characterCount} characters`,
      supabase,
      generation.id
    )

    // TODO: Queue generation job (implement with background job processor)
    // For now, we'll just return the pending generation
    // In production, you'd use something like:
    // - BullMQ for job queuing
    // - Trigger serverless function
    // - Send to n8n webhook for processing

    const response = successResponse(generation, 201)
    return addRateLimitHeaders(response, 100, 99)
  } catch (error) {
    console.error('Error creating generation:', error)
    return errorResponse('Failed to create generation', 'CREATE_ERROR', 500)
  }
}
