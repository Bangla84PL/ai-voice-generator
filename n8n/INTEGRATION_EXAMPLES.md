# n8n Integration Examples

This document provides practical examples of integrating n8n webhooks into your AI Voice Generator application.

## Table of Contents

- [User Registration](#user-registration)
- [Voice Generation](#voice-generation)
- [Credit Management](#credit-management)
- [Stripe Integration](#stripe-integration)
- [API Routes](#api-routes)

## User Registration

### After Sign Up (Auth Callback)

```typescript
// app/api/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { triggerUserOnboarding } from '@/lib/n8n/webhooks';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient();

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;

      // Create user profile
      const { data: profile } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata.name || 'User',
          credits: 1000, // Bonus credits
        })
        .select()
        .single();

      // Trigger n8n onboarding workflow
      try {
        await triggerUserOnboarding({
          userId: user.id,
          email: user.email!,
          name: user.user_metadata.name || 'User',
          bonusCredits: 1000,
          createdAt: user.created_at,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        });

        console.log('✅ User onboarding workflow triggered');
      } catch (webhookError) {
        // Don't fail registration if webhook fails
        console.error('⚠️ Failed to trigger onboarding webhook:', webhookError);
      }
    }
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
}
```

## Voice Generation

### After Generation Completes

```typescript
// app/api/generate/route.ts
import { createClient } from '@/lib/supabase/server';
import { triggerGenerationComplete } from '@/lib/n8n/webhooks';
import { generateVoice } from '@/lib/ai/voice-generator';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { text, voice, settings } = await request.json();

  try {
    // Generate the voice
    const audioBuffer = await generateVoice(text, voice, settings);

    // Upload to storage
    const fileName = `${user.id}/${Date.now()}.mp3`;
    const { data: uploadData } = await supabase.storage
      .from('audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
      });

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(fileName);

    // Calculate credits
    const creditsUsed = text.length; // 1 credit per character

    // Update user credits
    const { data: profile } = await supabase
      .from('profiles')
      .update({
        credits: supabase.raw('credits - ?', [creditsUsed])
      })
      .eq('id', user.id)
      .select()
      .single();

    // Save generation record
    const { data: generation } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        text,
        voice,
        audio_url: publicUrl,
        credits_used: creditsUsed,
        status: 'completed',
      })
      .select()
      .single();

    // Get user's custom webhook (if any)
    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('custom_webhook_url')
      .eq('user_id', user.id)
      .single();

    // Trigger n8n generation complete workflow
    try {
      await triggerGenerationComplete({
        userId: user.id,
        email: user.email!,
        name: profile.name,
        generationId: generation.id,
        text,
        voice,
        audioUrl: publicUrl,
        downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/download/${generation.id}`,
        creditsUsed,
        creditsRemaining: profile.credits,
        duration: audioBuffer.length / 1000, // estimate duration
        customWebhookUrl: userSettings?.custom_webhook_url,
      });

      console.log('✅ Generation complete workflow triggered');
    } catch (webhookError) {
      console.error('⚠️ Failed to trigger generation webhook:', webhookError);
      // Continue - don't fail the generation
    }

    return Response.json({
      success: true,
      generation,
      audioUrl: publicUrl,
      creditsRemaining: profile.credits,
    });

  } catch (error) {
    console.error('Generation error:', error);
    return new Response('Generation failed', { status: 500 });
  }
}
```

## Credit Management

### Monitor Credit Thresholds

```typescript
// lib/credits/monitor.ts
import { createClient } from '@/lib/supabase/server';
import { triggerCreditAlert } from '@/lib/n8n/webhooks';

interface CreditThreshold {
  userId: string;
  threshold: 80 | 90 | 100;
  lastAlertSent?: string;
}

/**
 * Check if user has crossed credit thresholds
 */
export async function checkCreditThresholds(
  userId: string,
  creditsRemaining: number,
  totalCredits: number
): Promise<void> {
  const supabase = createClient();

  // Calculate usage percentage
  const usagePercent = ((totalCredits - creditsRemaining) / totalCredits) * 100;

  // Determine which threshold was crossed
  let threshold: 80 | 90 | 100 | null = null;
  if (creditsRemaining === 0) {
    threshold = 100;
  } else if (usagePercent >= 90) {
    threshold = 90;
  } else if (usagePercent >= 80) {
    threshold = 80;
  }

  if (!threshold) {
    return; // No threshold crossed
  }

  // Check if we already sent this alert
  const { data: existingAlert } = await supabase
    .from('credit_alerts')
    .select('*')
    .eq('user_id', userId)
    .eq('threshold', threshold)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Within 24 hours
    .single();

  if (existingAlert) {
    return; // Alert already sent recently
  }

  // Get user details
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, name')
    .eq('id', userId)
    .single();

  if (!profile) {
    return;
  }

  // Trigger credit alert workflow
  try {
    await triggerCreditAlert({
      userId,
      email: profile.email,
      name: profile.name,
      creditsRemaining,
      threshold,
      purchaseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/credits`,
    });

    // Record that we sent the alert
    await supabase
      .from('credit_alerts')
      .insert({
        user_id: userId,
        threshold,
        credits_remaining: creditsRemaining,
      });

    console.log(`✅ Credit alert sent: ${threshold}% threshold for user ${userId}`);
  } catch (error) {
    console.error('⚠️ Failed to trigger credit alert:', error);
  }
}

/**
 * Deduct credits and check thresholds
 */
export async function deductCredits(
  userId: string,
  amount: number
): Promise<{ success: boolean; creditsRemaining: number }> {
  const supabase = createClient();

  // Get current credits
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits, plan')
    .eq('id', userId)
    .single();

  if (!profile) {
    throw new Error('User not found');
  }

  if (profile.credits < amount) {
    throw new Error('Insufficient credits');
  }

  // Deduct credits
  const newCredits = profile.credits - amount;
  await supabase
    .from('profiles')
    .update({ credits: newCredits })
    .eq('id', userId);

  // Determine total credits based on plan
  const totalCredits = getTotalCreditsForPlan(profile.plan);

  // Check thresholds
  await checkCreditThresholds(userId, newCredits, totalCredits);

  return {
    success: true,
    creditsRemaining: newCredits,
  };
}

function getTotalCreditsForPlan(plan: string): number {
  const planCredits: Record<string, number> = {
    free: 10000,
    pro: 500000,
    enterprise: 2000000,
  };
  return planCredits[plan] || 10000;
}
```

## Stripe Integration

### Handle Subscription Events

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { triggerSubscriptionChanged } from '@/lib/n8n/webhooks';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  const supabase = createClient();

  // Handle subscription created
  if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    // Get user by Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('stripe_customer_id', customerId)
      .single();

    if (profile) {
      const price = subscription.items.data[0].price;
      const planName = price.nickname || 'Pro';
      const amount = price.unit_amount || 0;
      const interval = price.recurring?.interval || 'month';

      // Determine credits based on plan
      const newCredits = planName === 'Pro' ? 500000 : 2000000;

      // Update user subscription
      await supabase
        .from('profiles')
        .update({
          plan: planName.toLowerCase(),
          credits: newCredits,
          stripe_subscription_id: subscription.id,
        })
        .eq('id', profile.id);

      // Trigger n8n workflow
      try {
        await triggerSubscriptionChanged({
          userId: profile.id,
          email: profile.email,
          name: profile.name,
          planName,
          amount,
          interval: interval as 'month' | 'year',
          newCredits,
          nextBillingDate: new Date(subscription.current_period_end * 1000).toISOString(),
          manageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
        });

        console.log('✅ Subscription changed workflow triggered');
      } catch (webhookError) {
        console.error('⚠️ Failed to trigger subscription webhook:', webhookError);
      }
    }
  }

  // Handle subscription updated
  if (event.type === 'customer.subscription.updated') {
    // Similar to above...
  }

  // Handle subscription cancelled
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('stripe_customer_id', customerId)
      .single();

    if (profile) {
      // Downgrade to free tier
      await supabase
        .from('profiles')
        .update({
          plan: 'free',
          credits: 10000,
          stripe_subscription_id: null,
        })
        .eq('id', profile.id);

      // You could trigger another workflow here for cancellation
    }
  }

  return Response.json({ received: true });
}
```

## API Routes

### Get User with Credit Check

```typescript
// middleware or utility function
import { createClient } from '@/lib/supabase/server';
import { checkCreditThresholds } from '@/lib/credits/monitor';

export async function getUserWithCreditCheck(userId: string) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) {
    return null;
  }

  // Check credit thresholds every time user data is fetched
  const totalCredits = getTotalCreditsForPlan(profile.plan);
  await checkCreditThresholds(userId, profile.credits, totalCredits);

  return profile;
}
```

### Batch Generation Example

```typescript
// app/api/generate/batch/route.ts
import { createClient } from '@/lib/supabase/server';
import { triggerGenerationComplete } from '@/lib/n8n/webhooks';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { items } = await request.json(); // Array of { text, voice }

  const results = [];

  for (const item of items) {
    try {
      // Generate voice (simplified)
      const generation = await generateAndSaveVoice(user.id, item);
      results.push(generation);

      // Trigger webhook for each generation
      await triggerGenerationComplete({
        userId: user.id,
        email: user.email!,
        name: user.user_metadata.name,
        generationId: generation.id,
        text: item.text,
        voice: item.voice,
        audioUrl: generation.audio_url,
        downloadUrl: generation.download_url,
        creditsUsed: generation.credits_used,
        creditsRemaining: generation.credits_remaining,
      });
    } catch (error) {
      console.error('Batch generation error:', error);
      results.push({ error: error.message });
    }
  }

  return Response.json({ results });
}
```

## Database Schema

### Required Tables for Credit Alerts

```sql
-- Credit alerts tracking table
CREATE TABLE credit_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  threshold INTEGER NOT NULL, -- 80, 90, or 100
  credits_remaining INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, threshold, created_at::date)
);

-- Index for performance
CREATE INDEX idx_credit_alerts_user_threshold
  ON credit_alerts(user_id, threshold, created_at DESC);

-- User settings for custom webhooks
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  custom_webhook_url TEXT,
  webhook_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Testing

### Test Webhook Integration

```typescript
// scripts/test-webhooks.ts
import {
  testWebhookConnection,
  triggerUserOnboarding,
  getWebhookConfig,
} from '@/lib/n8n/webhooks';

async function testWebhooks() {
  console.log('Testing n8n webhook integration...\n');

  // 1. Check configuration
  const config = getWebhookConfig();
  console.log('Configuration:', config);

  // 2. Test connection
  console.log('\nTesting connection...');
  const isConnected = await testWebhookConnection();
  console.log(isConnected ? '✅ Connected' : '❌ Connection failed');

  // 3. Test user onboarding
  console.log('\nTesting user onboarding...');
  const result = await triggerUserOnboarding({
    userId: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    bonusCredits: 1000,
    createdAt: new Date().toISOString(),
    dashboardUrl: 'https://example.com/dashboard',
  });
  console.log(result.success ? '✅ Success' : '❌ Failed', result);
}

testWebhooks();
```

Run with:
```bash
npx tsx scripts/test-webhooks.ts
```

## Best Practices

1. **Error Handling**: Always wrap webhook calls in try-catch
2. **Don't Block**: Use fire-and-forget pattern for webhooks
3. **Retry Logic**: Built-in retry logic handles transient failures
4. **Monitoring**: Log all webhook calls for debugging
5. **Testing**: Test webhooks in development before production
6. **Security**: Use webhook secrets for authentication
7. **Rate Limiting**: Be mindful of n8n execution limits

## Next Steps

1. Import all workflows into n8n
2. Configure environment variables
3. Integrate webhooks into your application
4. Test thoroughly in development
5. Monitor executions in production
6. Set up alerts for failed workflows
