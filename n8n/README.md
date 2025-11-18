# n8n Integration for AI Voice Generator

This directory contains n8n workflow definitions and client libraries for automating various tasks in the AI Voice Generator application.

## Overview

n8n is a workflow automation platform that allows you to connect different services and automate tasks. This integration provides workflows for:

1. **User Onboarding** - Welcome emails and CRM updates when users sign up
2. **Generation Complete** - Notifications when voice generation finishes
3. **Credit Threshold** - Alerts when users run low on credits (80%, 90%, 100%)
4. **Subscription Changed** - Handle subscription events and send confirmations
5. **Invoice Generation** - Monthly scheduled invoice generation and delivery

## Directory Structure

```
n8n/
├── README.md                           # This file
├── workflows/                          # n8n workflow JSON files
│   ├── user-onboarding.json           # User signup workflow
│   ├── generation-complete.json       # Generation completion workflow
│   ├── credit-threshold.json          # Credit alert workflow
│   ├── subscription-changed.json      # Subscription management workflow
│   └── invoice-generation.json        # Monthly invoice workflow
└── [TypeScript client at: src/lib/n8n/webhooks.ts]
```

## Setup Instructions

### 1. Install and Configure n8n

#### Option A: Self-Hosted (VPS)

```bash
# Using Docker (recommended)
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=your-secure-password \
  -e WEBHOOK_URL=https://n8n.smartcamp.ai \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n

# Or using npm
npm install n8n -g
n8n start
```

#### Option B: n8n Cloud

Sign up at [n8n.cloud](https://n8n.cloud) for a managed solution.

### 2. Import Workflows

1. Open your n8n instance (e.g., `https://n8n.smartcamp.ai`)
2. Go to **Workflows** → **Import from File**
3. Import each JSON file from the `workflows/` directory:
   - `user-onboarding.json`
   - `generation-complete.json`
   - `credit-threshold.json`
   - `subscription-changed.json`
   - `invoice-generation.json`

### 3. Configure Environment Variables

Add these to your n8n environment:

```bash
# Email Service (Resend)
EMAIL_API_URL=https://api.resend.com
EMAIL_API_KEY=re_your_api_key
EMAIL_FROM=noreply@smartcamp.ai

# Optional: CRM Integration
CRM_API_URL=https://api.yourcrm.com
CRM_API_KEY=your_crm_api_key

# Optional: Email List (e.g., Mailchimp, ConvertKit)
EMAIL_LIST_API_URL=https://api.convertkit.com/v3
EMAIL_LIST_API_KEY=your_email_list_key

# Optional: Analytics
ANALYTICS_API_URL=https://analytics.yourservice.com
ANALYTICS_API_KEY=your_analytics_key

# Optional: Slack Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Application URLs
NEXT_PUBLIC_APP_URL=https://voice.smartcamp.ai
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Gotenberg (PDF Generation)
GOTENBERG_API_URL=https://gotenberg.smartcamp.ai

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

### 4. Configure Application Environment

Add these to your `.env.local` or `.env.production`:

```bash
# n8n Webhook Configuration
N8N_WEBHOOK_BASE_URL=https://n8n.smartcamp.ai/webhook/
N8N_WEBHOOK_SECRET=your-webhook-secret-key

# Webhook Settings
WEBHOOK_TIMEOUT=5000
WEBHOOK_MAX_RETRIES=3
WEBHOOK_RETRY_DELAY=1000
```

### 5. Activate Workflows

1. Open each workflow in n8n
2. Click the **Activate** toggle in the top right
3. Verify the webhook URL is accessible

## Usage

### Triggering Webhooks from Your Application

```typescript
import {
  triggerUserOnboarding,
  triggerGenerationComplete,
  triggerCreditAlert,
  triggerSubscriptionChanged,
} from '@/lib/n8n/webhooks';

// When a new user signs up
await triggerUserOnboarding({
  userId: user.id,
  email: user.email,
  name: user.name,
  bonusCredits: 1000,
  createdAt: user.created_at,
  dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
});

// When generation completes
await triggerGenerationComplete({
  userId: generation.user_id,
  email: user.email,
  name: user.name,
  generationId: generation.id,
  text: generation.text,
  voice: generation.voice,
  audioUrl: generation.audio_url,
  downloadUrl: generation.download_url,
  creditsUsed: generation.credits_used,
  creditsRemaining: user.credits_remaining,
});

// When credits hit threshold
await triggerCreditAlert({
  userId: user.id,
  email: user.email,
  name: user.name,
  creditsRemaining: user.credits_remaining,
  threshold: 80, // or 90, 100
  purchaseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/credits`,
});

// When subscription changes
await triggerSubscriptionChanged({
  userId: user.id,
  email: user.email,
  name: user.name,
  planName: 'Pro',
  amount: 2999, // in cents
  interval: 'month',
  newCredits: 500000,
  nextBillingDate: nextBillingDate.toISOString(),
  manageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
});
```

### Testing Webhooks

```typescript
import { testWebhookConnection, getWebhookConfig } from '@/lib/n8n/webhooks';

// Test connection
const isConnected = await testWebhookConnection();
console.log('n8n connection:', isConnected ? 'OK' : 'Failed');

// Get configuration
const config = getWebhookConfig();
console.log('Webhook config:', config);
```

## Workflow Details

### 1. User Onboarding

**Trigger:** Webhook on new user signup
**Actions:**
- Send welcome email
- Create CRM entry (optional)
- Add to email list (optional)

**Payload:**
```typescript
{
  userId: string;
  email: string;
  name: string;
  bonusCredits: number;
  createdAt: string;
  dashboardUrl?: string;
}
```

### 2. Generation Complete

**Trigger:** Webhook when generation finishes
**Actions:**
- Send notification email
- Update analytics
- Trigger custom webhooks (if configured)

**Payload:**
```typescript
{
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
  customWebhookUrl?: string;
}
```

### 3. Credit Threshold

**Trigger:** Webhook on 80%, 90%, or 100% credit usage
**Actions:**
- Send alert email (severity based on threshold)
- Optional Slack notification

**Payload:**
```typescript
{
  userId: string;
  email: string;
  name: string;
  creditsRemaining: number;
  threshold: 80 | 90 | 100;
  purchaseUrl?: string;
}
```

### 4. Subscription Changed

**Trigger:** Webhook on subscription events
**Actions:**
- Update user credits
- Send confirmation email
- Update CRM/billing system
- Track subscription event

**Payload:**
```typescript
{
  userId: string;
  email: string;
  name: string;
  planName: string;
  amount: number;
  interval: 'month' | 'year';
  newCredits: number;
  nextBillingDate: string;
  manageUrl?: string;
}
```

### 5. Invoice Generation

**Trigger:** Scheduled (1st of each month)
**Actions:**
- Calculate monthly usage
- Generate PDF invoice (Gotenberg)
- Upload to storage
- Email invoice
- Save invoice record

**Note:** This workflow runs automatically via schedule trigger.

## Security

### Webhook Authentication

All webhooks support optional secret-based authentication:

1. Set `N8N_WEBHOOK_SECRET` in your application environment
2. The secret is sent as `X-Webhook-Secret` header
3. Verify the header in n8n workflows if needed

### Environment Variables

Never commit sensitive credentials to git. Use environment variables for:
- API keys
- Webhook URLs
- Service credentials

## Monitoring

### Webhook Errors

Failed webhooks are logged automatically:

```typescript
// Errors are logged to console
console.error('[n8n Webhook Error]', {
  webhook: 'user-onboarding',
  payload: {...},
  error: 'Connection timeout',
  timestamp: '2025-11-18T00:00:00.000Z'
});
```

Consider integrating with error tracking services like:
- Sentry
- LogRocket
- Datadog

### n8n Executions

Monitor workflow executions in n8n:
1. Go to **Executions** in n8n UI
2. Filter by workflow
3. View success/failure rates
4. Debug failed executions

## Troubleshooting

### Webhooks Not Triggering

1. **Check n8n is running:**
   ```bash
   curl https://n8n.smartcamp.ai/healthz
   ```

2. **Verify workflow is active:**
   - Open workflow in n8n
   - Check "Active" toggle is ON

3. **Test webhook URL:**
   ```bash
   curl -X POST https://n8n.smartcamp.ai/webhook/user-onboarding \
     -H "Content-Type: application/json" \
     -d '{"body":{"userId":"test","email":"test@example.com","name":"Test"}}'
   ```

4. **Check application logs:**
   ```bash
   # Look for n8n webhook errors
   docker logs your-app-container | grep "n8n"
   ```

### Email Not Sending

1. **Verify email credentials:**
   - Check `EMAIL_API_KEY` is set in n8n
   - Test with Resend dashboard

2. **Check email templates:**
   - Review HTML in workflow nodes
   - Test with a known working email

3. **Review n8n execution logs:**
   - Check for HTTP errors (401, 403, etc.)

### PDF Generation Issues

1. **Verify Gotenberg is running:**
   ```bash
   curl http://gotenberg:3000/health
   ```

2. **Check PDF content:**
   - Ensure HTML is valid
   - Test with simple HTML first

3. **Review storage permissions:**
   - Verify Supabase storage bucket exists
   - Check service role key has write access

## Advanced Configuration

### Custom Webhooks

Users can configure custom webhooks to be triggered on generation complete:

```typescript
await triggerGenerationComplete({
  // ... other fields
  customWebhookUrl: 'https://user-custom-webhook.com/callback'
});
```

### Batch Operations

Trigger multiple webhooks at once:

```typescript
import { triggerMultipleWebhooks } from '@/lib/n8n/webhooks';

await triggerMultipleWebhooks([
  { type: 'onboarding', payload: onboardingData },
  { type: 'credit', payload: creditData },
]);
```

## Integration Examples

### Example: Integrate with Stripe Webhooks

```typescript
// In your Stripe webhook handler
import { triggerSubscriptionChanged } from '@/lib/n8n/webhooks';

export async function POST(req: Request) {
  const event = await stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get('stripe-signature'),
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object;

    await triggerSubscriptionChanged({
      userId: subscription.metadata.userId,
      email: subscription.metadata.email,
      name: subscription.metadata.name,
      planName: subscription.items.data[0].price.nickname,
      amount: subscription.items.data[0].price.unit_amount,
      interval: subscription.items.data[0].price.recurring.interval,
      newCredits: calculateCredits(subscription),
      nextBillingDate: new Date(subscription.current_period_end * 1000).toISOString(),
    });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
```

### Example: Monitor Credit Usage

```typescript
// After each generation
async function checkCreditThresholds(userId: string, creditsRemaining: number, totalCredits: number) {
  const usagePercent = ((totalCredits - creditsRemaining) / totalCredits) * 100;

  const thresholds = [80, 90, 100];
  const threshold = thresholds.find(t => usagePercent >= t);

  if (threshold && !hasAlertBeenSent(userId, threshold)) {
    await triggerCreditAlert({
      userId,
      email: user.email,
      name: user.name,
      creditsRemaining,
      threshold,
      purchaseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/credits`,
    });

    markAlertSent(userId, threshold);
  }
}
```

## Contributing

When adding new workflows:

1. Create workflow in n8n UI
2. Export as JSON
3. Add to `workflows/` directory
4. Update TypeScript types in `webhooks.ts`
5. Add trigger function
6. Document in this README

## Support

For issues or questions:
- Check n8n documentation: https://docs.n8n.io
- Review workflow executions in n8n UI
- Check application logs for webhook errors
- Contact DevOps team for infrastructure issues

## License

Part of AI Voice Generator by SmartCamp.AI
