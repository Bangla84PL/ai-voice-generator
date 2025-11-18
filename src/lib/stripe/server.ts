import Stripe from 'stripe';

// Environment variable validation
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

// Initialize Stripe server client
export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Error types
export class StripeServerError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'StripeServerError';
  }
}

// ============================================================================
// Customer Management
// ============================================================================

/**
 * Create a new Stripe customer
 */
export async function createCustomer(params: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: params.metadata,
    });

    return customer;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new StripeServerError(
        `Failed to create customer: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

/**
 * Get a customer by ID
 */
export async function getCustomer(
  customerId: string
): Promise<Stripe.Customer | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId);

    if (customer.deleted) {
      return null;
    }

    return customer as Stripe.Customer;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      if (error.statusCode === 404) {
        return null;
      }
      throw new StripeServerError(
        `Failed to get customer: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

/**
 * Update a customer
 */
export async function updateCustomer(
  customerId: string,
  params: Stripe.CustomerUpdateParams
): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.update(customerId, params);
    return customer;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new StripeServerError(
        `Failed to update customer: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

/**
 * Delete a customer
 */
export async function deleteCustomer(customerId: string): Promise<void> {
  try {
    await stripe.customers.del(customerId);
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new StripeServerError(
        `Failed to delete customer: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

// ============================================================================
// Subscription Management
// ============================================================================

/**
 * Create a subscription
 */
export async function createSubscription(params: {
  customerId: string;
  priceId: string;
  trialDays?: number;
  metadata?: Record<string, string>;
}): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: params.customerId,
      items: [{ price: params.priceId }],
      trial_period_days: params.trialDays,
      metadata: params.metadata,
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    return subscription;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new StripeServerError(
        `Failed to create subscription: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

/**
 * Get a subscription by ID
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      if (error.statusCode === 404) {
        return null;
      }
      throw new StripeServerError(
        `Failed to get subscription: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

/**
 * Get customer's active subscriptions
 */
export async function getCustomerSubscriptions(
  customerId: string
): Promise<Stripe.Subscription[]> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    });

    return subscriptions.data;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new StripeServerError(
        `Failed to get subscriptions: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

/**
 * Update a subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  params: Stripe.SubscriptionUpdateParams
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(
      subscriptionId,
      params
    );
    return subscription;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new StripeServerError(
        `Failed to update subscription: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediate: boolean = false
): Promise<Stripe.Subscription> {
  try {
    if (immediate) {
      return await stripe.subscriptions.cancel(subscriptionId);
    } else {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    }
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new StripeServerError(
        `Failed to cancel subscription: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

/**
 * Resume a cancelled subscription
 */
export async function resumeSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new StripeServerError(
        `Failed to resume subscription: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

// ============================================================================
// Checkout Sessions
// ============================================================================

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(params: {
  customerId?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  clientReferenceId?: string;
  metadata?: Record<string, string>;
  allowPromotionCodes?: boolean;
  quantity?: number;
}): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: params.customerId,
      client_reference_id: params.clientReferenceId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
          quantity: params.quantity || 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      allow_promotion_codes: params.allowPromotionCodes ?? true,
      metadata: params.metadata,
    });

    return session;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new StripeServerError(
        `Failed to create checkout session: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

/**
 * Create a checkout session for one-time payment (credits)
 */
export async function createCreditCheckoutSession(params: {
  customerId?: string;
  amount: number; // in cents
  credits: number;
  successUrl: string;
  cancelUrl: string;
  clientReferenceId?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: params.customerId,
      client_reference_id: params.clientReferenceId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${params.credits} Voice Generation Credits`,
              description: `Purchase ${params.credits} credits for AI voice generation`,
            },
            unit_amount: params.amount,
          },
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        ...params.metadata,
        credits: params.credits.toString(),
        type: 'credit_purchase',
      },
    });

    return session;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new StripeServerError(
        `Failed to create credit checkout session: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

// ============================================================================
// Customer Portal
// ============================================================================

/**
 * Create a customer portal session
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new StripeServerError(
        `Failed to create portal session: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

// ============================================================================
// Invoices
// ============================================================================

/**
 * Get an invoice by ID
 */
export async function getInvoice(
  invoiceId: string
): Promise<Stripe.Invoice | null> {
  try {
    const invoice = await stripe.invoices.retrieve(invoiceId);
    return invoice;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      if (error.statusCode === 404) {
        return null;
      }
      throw new StripeServerError(
        `Failed to get invoice: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

/**
 * List customer invoices
 */
export async function getCustomerInvoices(
  customerId: string,
  limit: number = 10
): Promise<Stripe.Invoice[]> {
  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    });

    return invoices.data;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new StripeServerError(
        `Failed to get invoices: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

/**
 * Create an invoice
 */
export async function createInvoice(params: {
  customerId: string;
  description?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Invoice> {
  try {
    const invoice = await stripe.invoices.create({
      customer: params.customerId,
      description: params.description,
      metadata: params.metadata,
      auto_advance: true,
    });

    return invoice;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new StripeServerError(
        `Failed to create invoice: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

/**
 * Finalize and send an invoice
 */
export async function finalizeInvoice(
  invoiceId: string
): Promise<Stripe.Invoice> {
  try {
    const invoice = await stripe.invoices.finalizeInvoice(invoiceId, {
      auto_advance: true,
    });

    return invoice;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new StripeServerError(
        `Failed to finalize invoice: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

// ============================================================================
// Payment Methods
// ============================================================================

/**
 * Get customer's payment methods
 */
export async function getPaymentMethods(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new StripeServerError(
        `Failed to get payment methods: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

// ============================================================================
// Prices and Products
// ============================================================================

/**
 * Get all active prices
 */
export async function getActivePrices(): Promise<Stripe.Price[]> {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    return prices.data;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new StripeServerError(
        `Failed to get prices: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

/**
 * Get a price by ID
 */
export async function getPrice(priceId: string): Promise<Stripe.Price | null> {
  try {
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product'],
    });

    return price;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      if (error.statusCode === 404) {
        return null;
      }
      throw new StripeServerError(
        `Failed to get price: ${error.message}`,
        error.code,
        error.statusCode
      );
    }
    throw error;
  }
}

// ============================================================================
// Webhook Helpers
// ============================================================================

/**
 * Construct webhook event from request
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new StripeServerError('STRIPE_WEBHOOK_SECRET is not configured');
  }

  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new StripeServerError(
        `Webhook signature verification failed: ${error.message}`,
        'WEBHOOK_VERIFICATION_FAILED'
      );
    }
    throw error;
  }
}

// Export Stripe types for convenience
export type {
  Stripe,
};
