/**
 * Stripe Webhook API Route
 * POST /api/webhooks/stripe - Handle Stripe webhook events
 */

import { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { successResponse, errorResponse } from '@/lib/api/utils'

export const runtime = 'nodejs'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events for subscriptions and payments
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return errorResponse('Missing signature', 'INVALID_SIGNATURE', 400)
    }

    // Verify webhook signature
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return errorResponse('Invalid signature', 'INVALID_SIGNATURE', 400)
    }

    const supabase = createAdminClient()

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session, supabase)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription, supabase)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription, supabase)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(invoice, supabase)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice, supabase)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return successResponse({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return errorResponse('Webhook processing failed', 'WEBHOOK_ERROR', 500)
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: any
) {
  const userId = session.metadata?.userId
  const creditsAmount = session.metadata?.creditsAmount

  if (!userId) {
    console.error('No userId in session metadata')
    return
  }

  // If it's a one-time credit purchase
  if (creditsAmount && session.mode === 'payment') {
    const credits = parseInt(creditsAmount, 10)

    // Add credits to user balance
    await supabase.rpc('add_user_credits', {
      p_user_id: userId,
      p_amount: credits,
    })

    // Log the transaction
    await supabase.from('voicegen_credits').insert({
      user_id: userId,
      amount: credits,
      type: 'purchase',
      description: `Credit purchase - ${credits} credits`,
      reference_id: session.id,
    })
  }
}

/**
 * Handle subscription creation/update
 */
async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const userId = subscription.metadata?.userId

  if (!userId) {
    console.error('No userId in subscription metadata')
    return
  }

  const plan = subscription.items.data[0]?.price.metadata?.plan as 'pro' | 'enterprise' | undefined

  if (!plan) {
    console.error('No plan in subscription metadata')
    return
  }

  // Upsert subscription record
  await supabase.from('voicegen_subscriptions').upsert({
    id: subscription.id,
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    plan,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  })

  // Update user role
  await supabase
    .from('voicegen_users')
    .update({
      role: plan,
      subscription_id: subscription.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  // Add subscription credits if active
  if (subscription.status === 'active') {
    const monthlyCredits = plan === 'pro' ? 10000 : 50000

    await supabase.rpc('add_user_credits', {
      p_user_id: userId,
      p_amount: monthlyCredits,
    })

    await supabase.from('voicegen_credits').insert({
      user_id: userId,
      amount: monthlyCredits,
      type: 'subscription',
      description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} subscription credits`,
      reference_id: subscription.id,
    })
  }
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: any
) {
  // Update subscription status
  await supabase
    .from('voicegen_subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  // Downgrade user to free tier
  const { data: sub } = await supabase
    .from('voicegen_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (sub) {
    await supabase
      .from('voicegen_users')
      .update({
        role: 'user',
        subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.user_id)
  }
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  supabase: any
) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    )
    await handleSubscriptionUpdate(subscription, supabase)
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: any
) {
  if (invoice.subscription) {
    await supabase
      .from('voicegen_subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription)
  }
}
