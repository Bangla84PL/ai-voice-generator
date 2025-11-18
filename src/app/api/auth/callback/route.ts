/**
 * Auth Callback API Route
 * GET /api/auth/callback - OAuth callback handler
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'

/**
 * GET /api/auth/callback
 * Handles OAuth callback and exchanges code for session
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(errorDescription || error)}`,
        request.url
      )
    )
  }

  // Exchange code for session
  if (code) {
    const supabase = createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent(exchangeError.message)}`,
          request.url
        )
      )
    }

    // Get user to ensure profile exists
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Check if user profile exists, create if not
      const { data: profile } = await supabase
        .from('voicegen_users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!profile) {
        // Create user profile
        await supabase.from('voicegen_users').insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          role: 'user',
          credits_balance: 100, // Welcome bonus
        })

        // Log welcome credits
        await supabase.from('voicegen_credits').insert({
          user_id: user.id,
          amount: 100,
          type: 'bonus',
          description: 'Welcome bonus credits',
        })
      }
    }
  }

  // Redirect to destination
  return NextResponse.redirect(new URL(next, request.url))
}
