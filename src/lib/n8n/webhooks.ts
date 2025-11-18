/**
 * n8n Webhook Integration
 *
 * This module provides type-safe functions to trigger n8n workflows
 * for various application events.
 */

// ============================================================================
// Configuration
// ============================================================================

const N8N_WEBHOOK_BASE_URL = process.env.N8N_WEBHOOK_BASE_URL || 'https://n8n.smartcamp.ai/webhook/';
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || '';
const WEBHOOK_TIMEOUT = parseInt(process.env.WEBHOOK_TIMEOUT || '5000', 10);
const WEBHOOK_MAX_RETRIES = parseInt(process.env.WEBHOOK_MAX_RETRIES || '3', 10);
const WEBHOOK_RETRY_DELAY = parseInt(process.env.WEBHOOK_RETRY_DELAY || '1000', 10);

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * User onboarding webhook payload
 */
export interface UserOnboardingPayload {
  userId: string;
  email: string;
  name: string;
  bonusCredits: number;
  createdAt: string;
  dashboardUrl?: string;
}

/**
 * Generation complete webhook payload
 */
export interface GenerationCompletePayload {
  userId: string;
  email: string;
  name: string;
  generationId: string;
  text: string;
  voice: string;
  audioUrl: string;
  downloadUrl: string;
  creditsUsed: number;
  creditsRemaining: number;
  duration?: number;
  customWebhookUrl?: string;
}

/**
 * Credit threshold alert webhook payload
 */
export interface CreditAlertPayload {
  userId: string;
  email: string;
  name: string;
  creditsRemaining: number;
  threshold: number; // 80, 90, or 100
  purchaseUrl?: string;
}

/**
 * Subscription changed webhook payload
 */
export interface SubscriptionChangedPayload {
  userId: string;
  email: string;
  name: string;
  planName: string;
  amount: number; // in cents
  interval: 'month' | 'year';
  newCredits: number;
  nextBillingDate: string;
  manageUrl?: string;
}

/**
 * Invoice generation webhook payload (for scheduled trigger)
 */
export interface InvoiceGenerationPayload {
  month: string; // YYYY-MM format
  users?: Array<{
    userId: string;
    email: string;
    name: string;
    totalAmount: number;
    billingPeriod: string;
    invoiceNumber: string;
    invoiceHtml: string;
  }>;
}

/**
 * Generic webhook response
 */
export interface WebhookResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

/**
 * Webhook error details
 */
export interface WebhookError {
  webhook: string;
  payload: any;
  error: string;
  timestamp: string;
  retries?: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Sleep for a given number of milliseconds
 */
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make HTTP request to n8n webhook with retry logic
 */
async function makeWebhookRequest(
  webhookPath: string,
  payload: any,
  retries = WEBHOOK_MAX_RETRIES
): Promise<WebhookResponse> {
  const url = `${N8N_WEBHOOK_BASE_URL}${webhookPath}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(N8N_WEBHOOK_SECRET && {
            'X-Webhook-Secret': N8N_WEBHOOK_SECRET,
          }),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      const isLastAttempt = attempt === retries;

      if (isLastAttempt) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[n8n Webhook] Failed after ${retries + 1} attempts:`, {
          webhook: webhookPath,
          error: errorMessage,
          payload,
        });

        return {
          success: false,
          error: errorMessage,
        };
      }

      // Wait before retrying
      await sleep(WEBHOOK_RETRY_DELAY * (attempt + 1));
    }
  }

  return {
    success: false,
    error: 'Max retries exceeded',
  };
}

/**
 * Log webhook errors for monitoring
 */
function logWebhookError(error: WebhookError): void {
  // In production, you might want to send this to a logging service
  // like Sentry, LogRocket, or your own monitoring system
  console.error('[n8n Webhook Error]', error);

  // You can also store errors in a database for later analysis
  // await supabase.from('webhook_errors').insert(error);
}

// ============================================================================
// Webhook Trigger Functions
// ============================================================================

/**
 * Trigger user onboarding workflow
 *
 * Called when a new user signs up
 */
export async function triggerUserOnboarding(
  payload: UserOnboardingPayload
): Promise<WebhookResponse> {
  console.log('[n8n] Triggering user onboarding workflow:', payload.userId);

  const response = await makeWebhookRequest('user-onboarding', {
    body: payload,
  });

  if (!response.success) {
    logWebhookError({
      webhook: 'user-onboarding',
      payload,
      error: response.error || 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }

  return response;
}

/**
 * Trigger generation complete workflow
 *
 * Called when a voice generation is finished
 */
export async function triggerGenerationComplete(
  payload: GenerationCompletePayload
): Promise<WebhookResponse> {
  console.log('[n8n] Triggering generation complete workflow:', payload.generationId);

  const response = await makeWebhookRequest('generation-complete', {
    body: payload,
  });

  if (!response.success) {
    logWebhookError({
      webhook: 'generation-complete',
      payload,
      error: response.error || 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }

  return response;
}

/**
 * Trigger credit threshold alert workflow
 *
 * Called when user credits hit 80%, 90%, or 100%
 */
export async function triggerCreditAlert(
  payload: CreditAlertPayload
): Promise<WebhookResponse> {
  console.log('[n8n] Triggering credit alert workflow:', {
    userId: payload.userId,
    threshold: payload.threshold,
  });

  const response = await makeWebhookRequest('credit-threshold', {
    body: payload,
  });

  if (!response.success) {
    logWebhookError({
      webhook: 'credit-threshold',
      payload,
      error: response.error || 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }

  return response;
}

/**
 * Trigger subscription changed workflow
 *
 * Called when a user's subscription is created, updated, or cancelled
 */
export async function triggerSubscriptionChanged(
  payload: SubscriptionChangedPayload
): Promise<WebhookResponse> {
  console.log('[n8n] Triggering subscription changed workflow:', {
    userId: payload.userId,
    plan: payload.planName,
  });

  const response = await makeWebhookRequest('subscription-changed', {
    body: payload,
  });

  if (!response.success) {
    logWebhookError({
      webhook: 'subscription-changed',
      payload,
      error: response.error || 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }

  return response;
}

/**
 * Trigger invoice generation workflow
 *
 * Note: This is typically triggered by n8n's schedule trigger,
 * but can also be called manually if needed
 */
export async function triggerInvoiceGeneration(
  payload: InvoiceGenerationPayload
): Promise<WebhookResponse> {
  console.log('[n8n] Triggering invoice generation workflow:', payload.month);

  const response = await makeWebhookRequest('invoice-generation', {
    body: payload,
  });

  if (!response.success) {
    logWebhookError({
      webhook: 'invoice-generation',
      payload,
      error: response.error || 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }

  return response;
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Trigger multiple webhooks in parallel
 *
 * Useful when you need to trigger multiple workflows at once
 */
export async function triggerMultipleWebhooks(
  webhooks: Array<{
    type: 'onboarding' | 'generation' | 'credit' | 'subscription' | 'invoice';
    payload: any;
  }>
): Promise<WebhookResponse[]> {
  console.log(`[n8n] Triggering ${webhooks.length} webhooks in parallel`);

  const promises = webhooks.map(({ type, payload }) => {
    switch (type) {
      case 'onboarding':
        return triggerUserOnboarding(payload);
      case 'generation':
        return triggerGenerationComplete(payload);
      case 'credit':
        return triggerCreditAlert(payload);
      case 'subscription':
        return triggerSubscriptionChanged(payload);
      case 'invoice':
        return triggerInvoiceGeneration(payload);
      default:
        return Promise.resolve({ success: false, error: 'Unknown webhook type' });
    }
  });

  return Promise.all(promises);
}

// ============================================================================
// Testing & Utilities
// ============================================================================

/**
 * Test webhook connection
 *
 * Useful for verifying n8n is properly configured
 */
export async function testWebhookConnection(): Promise<boolean> {
  try {
    const testPayload: UserOnboardingPayload = {
      userId: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      bonusCredits: 1000,
      createdAt: new Date().toISOString(),
      dashboardUrl: 'https://example.com/dashboard',
    };

    const response = await makeWebhookRequest('user-onboarding', {
      body: testPayload,
      test: true,
    });

    return response.success;
  } catch (error) {
    console.error('[n8n] Webhook connection test failed:', error);
    return false;
  }
}

/**
 * Get webhook configuration info
 */
export function getWebhookConfig() {
  return {
    baseUrl: N8N_WEBHOOK_BASE_URL,
    hasSecret: !!N8N_WEBHOOK_SECRET,
    timeout: WEBHOOK_TIMEOUT,
    maxRetries: WEBHOOK_MAX_RETRIES,
    retryDelay: WEBHOOK_RETRY_DELAY,
  };
}

// ============================================================================
// Export all
// ============================================================================

export default {
  triggerUserOnboarding,
  triggerGenerationComplete,
  triggerCreditAlert,
  triggerSubscriptionChanged,
  triggerInvoiceGeneration,
  triggerMultipleWebhooks,
  testWebhookConnection,
  getWebhookConfig,
};
