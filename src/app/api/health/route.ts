/**
 * Health Check API Route
 * GET /api/health - Returns service health status
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/utils'

export const runtime = 'edge'

/**
 * GET /api/health
 * Returns health status of the service
 */
export async function GET() {
  try {
    const supabase = createClient()

    // Check database connectivity
    const { error: dbError } = await supabase
      .from('voicegen_voices')
      .select('id')
      .limit(1)

    const health = {
      status: dbError ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: !dbError,
        api: true,
      },
    }

    if (dbError) {
      return NextResponse.json(health, { status: 503 })
    }

    return successResponse(health)
  } catch (error) {
    return errorResponse(
      'Health check failed',
      'HEALTH_CHECK_ERROR',
      503
    )
  }
}
