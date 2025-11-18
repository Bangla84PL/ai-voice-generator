import Stripe from 'stripe';
import { constructWebhookEvent, StripeServerError } from './server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Webhook event handler type
type WebhookHandler = (event: Stripe.Event) => Promise<void>;

// Webhook handlers map
const webhookHandlers: Map<string, WebhookHandler> = new Map();

/**
 * Register a webhook handler for a specific event type
 */
export function registerWebhookHandler(
  eventType: string,
  handler: WebhookHandler
): void {
  webhookHandlers.set(eventType, handler);
}

/**
 * Process a webhook event
 */
export async function processWebhookEvent(event: Stripe.Event): Promise<void> {
  const handler = webhookHandlers.get(event.type);

  if (handler) {
    await handler(event);
  } else {
    console.log(`Unhandled webhook event type: ${event.type}`);
  }
}

/**
 * Verify and process webhook from request
 */
export async function handleWebhook(
  payload: string | Buffer,
  signature: string
): Promise<{ received: boolean; error?: string }> {
  try {
    // Verify webhook signature and construct event
    const event = constructWebhookEvent(payload, signature);

    // Process the event
    await processWebhookEvent(event);

    return { received: true };
  } catch (error) {
    if (error instanceof StripeServerError) {
      return {
        received: false,
        error: error.message,
      };
    }

    if (error instanceof Error) {
      return {
        received: false,
        error: `Webhook processing failed: ${error.message}`,
      };
    }

    return {
      received: false,
      error: 'Unknown webhook processing error',
    };
  }
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle customer.created event
 */
async function handleCustomerCreated(event: Stripe.Event): Promise<void> {
  const customer = event.data.object as Stripe.Customer;

  console.log(`Customer created: ${customer.id}`);

  // Store customer information in database
  try {
    const { error } = await supabaseAdmin
      .from('customers')
      .upsert({
        stripe_customer_id: customer.id,
        email: customer.email,
        name: customer.name,
        metadata: customer.metadata,
        created_at: new Date(customer.created * 1000).toISOString(),
      });

    if (error) {
      console.error('Failed to store customer:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error handling customer.created:', error);
    throw error;
  }
}

/**
 * Handle customer.updated event
 */
async function handleCustomerUpdated(event: Stripe.Event): Promise<void> {
  const customer = event.data.object as Stripe.Customer;

  console.log(`Customer updated: ${customer.id}`);

  try {
    const { error } = await supabaseAdmin
      .from('customers')
      .update({
        email: customer.email,
        name: customer.name,
        metadata: customer.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customer.id);

    if (error) {
      console.error('Failed to update customer:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error handling customer.updated:', error);
    throw error;
  }
}

/**
 * Handle customer.deleted event
 */
async function handleCustomerDeleted(event: Stripe.Event): Promise<void> {
  const customer = event.data.object as Stripe.Customer;

  console.log(`Customer deleted: ${customer.id}`);

  try {
    const { error } = await supabaseAdmin
      .from('customers')
      .delete()
      .eq('stripe_customer_id', customer.id);

    if (error) {
      console.error('Failed to delete customer:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error handling customer.deleted:', error);
    throw error;
  }
}

/**
 * Handle customer.subscription.created event
 */
async function handleSubscriptionCreated(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;

  console.log(`Subscription created: ${subscription.id}`);

  try {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        status: subscription.status,
        price_id: subscription.items.data[0]?.price.id,
        quantity: subscription.items.data[0]?.quantity || 1,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
        cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        metadata: subscription.metadata,
        created_at: new Date(subscription.created * 1000).toISOString(),
      });

    if (error) {
      console.error('Failed to store subscription:', error);
      throw error;
    }

    // TODO: Send welcome email
  } catch (error) {
    console.error('Error handling subscription.created:', error);
    throw error;
  }
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;

  console.log(`Subscription updated: ${subscription.id}`);

  try {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: subscription.status,
        price_id: subscription.items.data[0]?.price.id,
        quantity: subscription.items.data[0]?.quantity || 1,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
        cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        metadata: subscription.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Failed to update subscription:', error);
      throw error;
    }

    // TODO: Handle status changes (e.g., send emails)
  } catch (error) {
    console.error('Error handling subscription.updated:', error);
    throw error;
  }
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;

  console.log(`Subscription deleted: ${subscription.id}`);

  try {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'canceled',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Failed to delete subscription:', error);
      throw error;
    }

    // TODO: Send cancellation email
  } catch (error) {
    console.error('Error handling subscription.deleted:', error);
    throw error;
  }
}

/**
 * Handle invoice.paid event
 */
async function handleInvoicePaid(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;

  console.log(`Invoice paid: ${invoice.id}`);

  try {
    // Store invoice in database
    const { error } = await supabaseAdmin
      .from('invoices')
      .upsert({
        stripe_invoice_id: invoice.id,
        stripe_customer_id: invoice.customer as string,
        stripe_subscription_id: invoice.subscription as string | null,
        amount_paid: invoice.amount_paid,
        amount_due: invoice.amount_due,
        currency: invoice.currency,
        status: invoice.status,
        invoice_pdf: invoice.invoice_pdf,
        hosted_invoice_url: invoice.hosted_invoice_url,
        metadata: invoice.metadata,
        paid_at: new Date(invoice.status_transitions.paid_at! * 1000).toISOString(),
        created_at: new Date(invoice.created * 1000).toISOString(),
      });

    if (error) {
      console.error('Failed to store invoice:', error);
      throw error;
    }

    // Handle credit purchases
    if (invoice.metadata?.type === 'credit_purchase' && invoice.metadata?.credits) {
      const credits = parseInt(invoice.metadata.credits, 10);

      // Add credits to customer account
      const { error: creditError } = await supabaseAdmin.rpc(
        'add_credits',
        {
          customer_id: invoice.customer as string,
          amount: credits,
        }
      );

      if (creditError) {
        console.error('Failed to add credits:', creditError);
        throw creditError;
      }
    }

    // TODO: Send invoice email
  } catch (error) {
    console.error('Error handling invoice.paid:', error);
    throw error;
  }
}

/**
 * Handle invoice.payment_failed event
 */
async function handleInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;

  console.log(`Invoice payment failed: ${invoice.id}`);

  try {
    // Update invoice status
    const { error } = await supabaseAdmin
      .from('invoices')
      .update({
        status: 'payment_failed',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_invoice_id', invoice.id);

    if (error) {
      console.error('Failed to update invoice:', error);
      throw error;
    }

    // TODO: Send payment failed email
  } catch (error) {
    console.error('Error handling invoice.payment_failed:', error);
    throw error;
  }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(event: Stripe.Event): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;

  console.log(`Checkout session completed: ${session.id}`);

  try {
    // Handle one-time purchases (credits)
    if (session.mode === 'payment' && session.metadata?.type === 'credit_purchase') {
      const credits = parseInt(session.metadata.credits || '0', 10);

      if (credits > 0 && session.customer) {
        const { error } = await supabaseAdmin.rpc(
          'add_credits',
          {
            customer_id: session.customer as string,
            amount: credits,
          }
        );

        if (error) {
          console.error('Failed to add credits from checkout:', error);
          throw error;
        }
      }
    }

    // TODO: Send purchase confirmation email
  } catch (error) {
    console.error('Error handling checkout.session.completed:', error);
    throw error;
  }
}

// ============================================================================
// Register all handlers
// ============================================================================

export function registerAllWebhookHandlers(): void {
  // Customer events
  registerWebhookHandler('customer.created', handleCustomerCreated);
  registerWebhookHandler('customer.updated', handleCustomerUpdated);
  registerWebhookHandler('customer.deleted', handleCustomerDeleted);

  // Subscription events
  registerWebhookHandler('customer.subscription.created', handleSubscriptionCreated);
  registerWebhookHandler('customer.subscription.updated', handleSubscriptionUpdated);
  registerWebhookHandler('customer.subscription.deleted', handleSubscriptionDeleted);

  // Invoice events
  registerWebhookHandler('invoice.paid', handleInvoicePaid);
  registerWebhookHandler('invoice.payment_failed', handleInvoicePaymentFailed);

  // Checkout events
  registerWebhookHandler('checkout.session.completed', handleCheckoutSessionCompleted);
}

// Auto-register handlers on import
registerAllWebhookHandlers();
