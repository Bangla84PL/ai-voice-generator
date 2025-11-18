/**
 * n8n Webhook API Route
 * POST /api/webhooks/n8n - Handle n8n workflow callbacks
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  successResponse,
  errorResponse,
  handleZodError,
} from '@/lib/api/utils'

export const runtime = 'edge'

// Validation schema for n8n webhook payload
const n8nWebhookSchema = z.object({
  generationId: z.string().uuid(),
  status: z.enum(['completed', 'failed']),
  audioUrl: z.string().url().optional(),
  audioDuration: z.number().positive().optional(),
  errorMessage: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

/**
 * POST /api/webhooks/n8n
 * Handles callbacks from n8n workflows for voice generation completion
 *
 * Expected payload:
 * {
 *   "generationId": "uuid",
 *   "status": "completed" | "failed",
 *   "audioUrl": "https://...",
 *   "audioDuration": 123.45,
 *   "errorMessage": "Error if failed",
 *   "metadata": {}
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET

    if (!expectedSecret) {
      console.error('N8N_WEBHOOK_SECRET not configured')
      return errorResponse('Webhook not configured', 'CONFIG_ERROR', 500)
    }

    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    // Parse and validate payload
    const body = await request.json()
    const validation = n8nWebhookSchema.safeParse(body)

    if (!validation.success) {
      return handleZodError(validation.error)
    }

    const { generationId, status, audioUrl, audioDuration, errorMessage, metadata } =
      validation.data

    const supabase = createAdminClient()

    // Fetch generation to verify it exists
    const { data: generation, error: fetchError } = await supabase
      .from('voicegen_generations')
      .select('id, user_id, status')
      .eq('id', generationId)
      .single()

    if (fetchError || !generation) {
      return errorResponse('Generation not found', 'NOT_FOUND', 404)
    }

    // Don't update if already completed or failed
    if (['completed', 'failed'].includes(generation.status)) {
      return successResponse({
        message: 'Generation already finalized',
        generation,
      })
    }

    // Update generation record
    const updateData: any = {
      status,
      completed_at: new Date().toISOString(),
    }

    if (status === 'completed') {
      if (!audioUrl) {
        return errorResponse(
          'audioUrl required for completed status',
          'VALIDATION_ERROR',
          400
        )
      }
      updateData.audio_url = audioUrl
      updateData.audio_duration = audioDuration || null
    }

    if (status === 'failed') {
      updateData.error_message = errorMessage || 'Generation failed'
    }

    const { data: updated, error: updateError } = await supabase
      .from('voicegen_generations')
      .update(updateData)
      .eq('id', generationId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating generation:', updateError)
      return errorResponse(
        'Failed to update generation',
        'UPDATE_ERROR',
        500
      )
    }

    // Trigger user webhook if configured
    const { data: userWebhooks } = await supabase
      .from('voicegen_webhooks')
      .select('*')
      .eq('user_id', generation.user_id)
      .eq('is_active', true)
      .contains('events', ['generation.completed'])

    if (userWebhooks && userWebhooks.length > 0) {
      // Queue webhook deliveries (in production, use a job queue)
      for (const webhook of userWebhooks) {
        try {
          await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Secret': webhook.secret,
              'X-Webhook-Event': 'generation.completed',
            },
            body: JSON.stringify({
              event: 'generation.completed',
              data: updated,
              timestamp: new Date().toISOString(),
            }),
          })
        } catch (error) {
          console.error('Failed to deliver webhook:', error)
        }
      }
    }

    return successResponse({
      message: 'Generation updated successfully',
      generation: updated,
    })
  } catch (error) {
    console.error('n8n webhook error:', error)
    return errorResponse('Webhook processing failed', 'WEBHOOK_ERROR', 500)
  }
}
