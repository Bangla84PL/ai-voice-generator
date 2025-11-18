/**
 * Download Generated Audio API Route
 * GET /api/generate/[id]/download - Download generated audio file
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { errorResponse, addRateLimitHeaders } from '@/lib/api/utils'
import { getCurrentUser } from '@/lib/supabase/server'

export const runtime = 'edge'

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * GET /api/generate/[id]/download
 * Downloads the generated audio file
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

    // Fetch generation
    const { data: generation, error } = await supabase
      .from('voicegen_generations')
      .select('status, audio_url, text')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !generation) {
      return errorResponse('Generation not found', 'NOT_FOUND', 404)
    }

    // Check if generation is completed
    if (generation.status !== 'completed') {
      return errorResponse(
        'Generation is not yet completed',
        'NOT_READY',
        400
      )
    }

    // Check if audio URL exists
    if (!generation.audio_url) {
      return errorResponse(
        'Audio file not available',
        'AUDIO_NOT_FOUND',
        404
      )
    }

    // For Supabase Storage URLs, create a signed URL
    if (generation.audio_url.includes('supabase')) {
      const bucketName = 'voicegen-audio'
      const filePath = generation.audio_url.split('/').slice(-1)[0]

      const { data: signedUrlData, error: urlError } = await supabase
        .storage
        .from(bucketName)
        .createSignedUrl(filePath, 3600) // 1 hour expiry

      if (urlError || !signedUrlData) {
        return errorResponse(
          'Failed to generate download URL',
          'URL_ERROR',
          500
        )
      }

      // Redirect to signed URL
      const response = NextResponse.redirect(signedUrlData.signedUrl)
      return addRateLimitHeaders(response)
    }

    // For external URLs, redirect directly
    const response = NextResponse.redirect(generation.audio_url)
    return addRateLimitHeaders(response)
  } catch (error) {
    console.error('Error downloading audio:', error)
    return errorResponse('Failed to download audio', 'DOWNLOAD_ERROR', 500)
  }
}
