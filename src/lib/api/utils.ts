/**
 * API Utility Functions
 * Shared utilities for API routes including error handling, responses, and validation
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Standard API error response
 */
export interface ApiError {
  error: {
    message: string
    code: string
    details?: unknown
  }
}

/**
 * Standard API success response
 */
export interface ApiSuccess<T = unknown> {
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  message: string,
  code: string = 'INTERNAL_ERROR',
  status: number = 500,
  details?: unknown
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: {
        message,
        code,
        ...(details && { details }),
      },
    },
    { status }
  )
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  meta?: ApiSuccess<T>['meta']
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    {
      data,
      ...(meta && { meta }),
    },
    { status }
  )
}

/**
 * Handle Zod validation errors
 */
export function handleZodError(error: ZodError): NextResponse<ApiError> {
  const firstError = error.errors[0]
  return errorResponse(
    firstError.message,
    'VALIDATION_ERROR',
    400,
    error.errors
  )
}

/**
 * Handle Supabase errors
 */
export function handleSupabaseError(error: {
  message: string
  code?: string
}): NextResponse<ApiError> {
  // Map common Supabase error codes to HTTP status codes
  const statusMap: Record<string, number> = {
    PGRST116: 404, // Not found
    '23505': 409, // Unique violation
    '23503': 400, // Foreign key violation
    '42501': 403, // Insufficient privileges
  }

  const status = error.code ? statusMap[error.code] || 500 : 500
  const code = error.code || 'DATABASE_ERROR'

  return errorResponse(error.message, code, status)
}

/**
 * Add rate limiting headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number = 100,
  remaining: number = 99,
  reset: number = Date.now() + 60000
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', reset.toString())
  return response
}

/**
 * Extract pagination params from URL
 */
export function getPaginationParams(
  searchParams: URLSearchParams
): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get('limit') || '10', 10))
  )
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * Check if user has sufficient credits
 */
export async function checkCredits(
  userId: string,
  requiredCredits: number,
  supabase: any
): Promise<boolean> {
  const { data: user } = await supabase
    .from('voicegen_users')
    .select('credits_balance')
    .eq('id', userId)
    .single()

  return (user?.credits_balance || 0) >= requiredCredits
}

/**
 * Deduct credits from user balance
 */
export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  supabase: any,
  referenceId?: string
): Promise<{ success: boolean; error?: string }> {
  // Start a transaction by updating balance and creating credit record
  const { error: updateError } = await supabase.rpc('deduct_user_credits', {
    p_user_id: userId,
    p_amount: amount,
  })

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Log the transaction
  const { error: logError } = await supabase.from('voicegen_credits').insert({
    user_id: userId,
    amount: -amount,
    type: 'generation',
    description,
    reference_id: referenceId,
  })

  if (logError) {
    // Log but don't fail - the balance was already updated
    console.error('Failed to log credit transaction:', logError)
  }

  return { success: true }
}

/**
 * Add credits to user balance
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: 'purchase' | 'subscription' | 'refund' | 'bonus',
  description: string,
  supabase: any,
  referenceId?: string
): Promise<{ success: boolean; error?: string }> {
  // Update balance
  const { error: updateError } = await supabase.rpc('add_user_credits', {
    p_user_id: userId,
    p_amount: amount,
  })

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Log the transaction
  const { error: logError } = await supabase.from('voicegen_credits').insert({
    user_id: userId,
    amount,
    type,
    description,
    reference_id: referenceId,
  })

  if (logError) {
    console.error('Failed to log credit transaction:', logError)
  }

  return { success: true }
}

/**
 * Calculate credits needed for text generation
 */
export function calculateCredits(characterCount: number): number {
  // 1 credit per 100 characters (rounded up)
  return Math.ceil(characterCount / 100)
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // This is a placeholder - implement actual signature verification
  // For Stripe, use stripe.webhooks.constructEvent
  // For custom webhooks, implement HMAC verification
  return true
}
