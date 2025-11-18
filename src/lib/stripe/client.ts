import { loadStripe, Stripe } from '@stripe/stripe-js';

// Environment variable validation
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable is not set');
}

// Singleton Stripe instance
let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get the Stripe.js instance (singleton pattern)
 * @returns Promise resolving to Stripe instance
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

// Stripe error types
export class StripeClientError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'StripeClientError';
  }
}

// Checkout session options
export interface CheckoutSessionOptions {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
  customerId?: string;
  clientReferenceId?: string;
  metadata?: Record<string, string>;
  allowPromotionCodes?: boolean;
  quantity?: number;
}

// Checkout session result
export interface CheckoutSessionResult {
  sessionId: string;
  url: string | null;
}

/**
 * Create a checkout session and redirect to Stripe Checkout
 * @param options - Checkout session options
 * @returns Promise resolving when redirect occurs
 */
export async function createCheckoutSession(
  options: CheckoutSessionOptions
): Promise<void> {
  try {
    const {
      priceId,
      successUrl = `${window.location.origin}/success`,
      cancelUrl = `${window.location.origin}/pricing`,
      customerId,
      clientReferenceId,
      metadata,
      allowPromotionCodes = true,
      quantity = 1,
    } = options;

    // Call API to create checkout session
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        successUrl,
        cancelUrl,
        customerId,
        clientReferenceId,
        metadata,
        allowPromotionCodes,
        quantity,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new StripeClientError(
        error.message || 'Failed to create checkout session',
        error.code
      );
    }

    const { sessionId }: CheckoutSessionResult = await response.json();

    // Redirect to Stripe Checkout
    const stripe = await getStripe();
    if (!stripe) {
      throw new StripeClientError('Failed to load Stripe.js');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      throw new StripeClientError(error.message, error.code);
    }
  } catch (error) {
    if (error instanceof StripeClientError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new StripeClientError(
        `Checkout session failed: ${error.message}`
      );
    }

    throw new StripeClientError('Unknown error occurred during checkout');
  }
}

/**
 * Redirect to Stripe Customer Portal
 * @param returnUrl - URL to return to after managing subscription
 */
export async function redirectToCustomerPortal(
  returnUrl?: string
): Promise<void> {
  try {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        returnUrl: returnUrl || window.location.origin,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new StripeClientError(
        error.message || 'Failed to create portal session',
        error.code
      );
    }

    const { url }: { url: string } = await response.json();

    // Redirect to customer portal
    window.location.href = url;
  } catch (error) {
    if (error instanceof StripeClientError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new StripeClientError(
        `Portal redirect failed: ${error.message}`
      );
    }

    throw new StripeClientError('Unknown error occurred during portal redirect');
  }
}

/**
 * Purchase credits with one-time payment
 * @param creditPackageId - The credit package ID
 * @param successUrl - URL to redirect after successful purchase
 * @param cancelUrl - URL to redirect if purchase is cancelled
 */
export async function purchaseCredits(
  creditPackageId: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<void> {
  try {
    const response = await fetch('/api/stripe/purchase-credits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creditPackageId,
        successUrl: successUrl || `${window.location.origin}/dashboard`,
        cancelUrl: cancelUrl || `${window.location.origin}/credits`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new StripeClientError(
        error.message || 'Failed to purchase credits',
        error.code
      );
    }

    const { sessionId }: CheckoutSessionResult = await response.json();

    // Redirect to Stripe Checkout
    const stripe = await getStripe();
    if (!stripe) {
      throw new StripeClientError('Failed to load Stripe.js');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      throw new StripeClientError(error.message, error.code);
    }
  } catch (error) {
    if (error instanceof StripeClientError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new StripeClientError(
        `Credit purchase failed: ${error.message}`
      );
    }

    throw new StripeClientError('Unknown error occurred during credit purchase');
  }
}

/**
 * Subscribe to a plan
 * @param priceId - The Stripe price ID
 * @param trialDays - Optional trial period in days
 */
export async function subscribeToPlan(
  priceId: string,
  trialDays?: number
): Promise<void> {
  await createCheckoutSession({
    priceId,
    metadata: trialDays ? { trial_days: trialDays.toString() } : undefined,
  });
}

/**
 * Update payment method
 */
export async function updatePaymentMethod(): Promise<void> {
  await redirectToCustomerPortal();
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(): Promise<void> {
  await redirectToCustomerPortal();
}
