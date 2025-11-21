# AI Voice Generator - Service Integration Plan

## Overview

This document outlines the integration plan for adding the following services to the AI Voice Generator application:

1. **Upstash Redis** - Caching and rate limiting
2. **PostHog** - Product analytics and feature flags
3. **Sentry** - Error monitoring and performance tracking
4. **Stripe** - Enhanced payment features (already partially integrated)
5. **Loops** - Email marketing and transactional emails

This document provides implementation guidance without making code changes. Each integration includes architecture decisions, configuration requirements, implementation steps, and testing strategies.

---

## 1. Upstash Redis Integration

### Purpose

- **Caching**: Cache frequently accessed data (voices, user profiles, generation stats)
- **Rate Limiting**: Implement distributed rate limiting across multiple instances
- **Session Storage**: Store user sessions and temporary data
- **Job Queues**: Queue voice generation jobs for processing

### Why Upstash?

- Serverless-friendly (pay per request)
- Global edge caching with low latency
- REST API for serverless environments
- Compatible with Redis clients

### Architecture

```
Next.js App → Upstash Redis → Fallback to Database
     ↓
Cache Layer:
  - Voice library (TTL: 1 hour)
  - User profiles (TTL: 15 minutes)
  - Rate limit counters (TTL: 1 minute - 1 hour)
  - Generation queue (persistent)
```

### Configuration

#### Environment Variables

Add to `.env.production`:

```bash
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Cache TTL settings (in seconds)
CACHE_TTL_SHORT=300           # 5 minutes - API responses
CACHE_TTL_MEDIUM=3600         # 1 hour - Voice library
CACHE_TTL_LONG=86400          # 24 hours - Static data
CACHE_TTL_SESSION=604800      # 7 days - User sessions

# Rate limiting with Redis
RATE_LIMIT_STORAGE=redis      # 'redis' or 'memory' (default: memory)
```

#### Getting Upstash Credentials

1. Sign up at https://upstash.com
2. Create a Redis database (choose region closest to your users)
3. Get REST URL and Token from database details
4. Enable TLS for production

### Implementation Plan

#### Phase 1: Setup & Connection

**Files to create/modify:**
- `src/lib/redis/client.ts` - Redis client initialization
- `src/lib/redis/cache.ts` - Cache wrapper functions
- `src/lib/redis/types.ts` - TypeScript types

**Key implementation points:**
```typescript
// Example structure (DO NOT implement yet)
// src/lib/redis/client.ts
// - Initialize Upstash Redis client
// - Export singleton instance
// - Handle connection errors gracefully
// - Fallback to no-cache mode if Redis unavailable

// src/lib/redis/cache.ts
// - get(key): Retrieve cached data
// - set(key, value, ttl): Store data with expiration
// - del(key): Delete cached data
// - invalidate(pattern): Clear cache by pattern
```

#### Phase 2: Caching Implementation

**Use cases:**

1. **Voice Library Caching**
   - Cache all voices on first request
   - Invalidate on voice updates
   - Key: `voices:all` or `voices:lang:{language}`
   - TTL: 1 hour

2. **User Profile Caching**
   - Cache user data and credit balance
   - Invalidate on profile updates or credit changes
   - Key: `user:{userId}:profile`
   - TTL: 15 minutes

3. **Generation History Caching**
   - Cache recent generations per user
   - Key: `user:{userId}:generations:recent`
   - TTL: 5 minutes

4. **API Response Caching**
   - Cache GET requests with stable data
   - Implement cache-control headers
   - Key: `api:{endpoint}:{params-hash}`
   - TTL: Variable based on endpoint

**Files to modify:**
- `src/lib/supabase/server.ts` - Add caching layer
- `src/app/api/voices/route.ts` - Cache voice listings
- `src/app/api/credits/balance/route.ts` - Cache with short TTL

#### Phase 3: Rate Limiting with Redis

**Current implementation**: In-memory rate limiting (not distributed)

**New implementation**: Redis-based distributed rate limiting

**Use cases:**
1. API endpoint rate limiting (per user/IP)
2. Voice generation rate limiting (per user)
3. Credit consumption throttling
4. Webhook rate limiting

**Files to create:**
- `src/lib/redis/rate-limiter.ts` - Distributed rate limiter
- `src/middleware/rate-limit.ts` - Middleware integration

**Algorithm**: Token bucket or sliding window counter

#### Phase 4: Session Storage

**Use cases:**
1. Store generation progress for real-time updates
2. Cache temporary data for multi-step operations
3. Store OAuth state for authentication flows

**Files to modify:**
- `src/lib/supabase/server.ts` - Session caching
- `src/app/api/generate/route.ts` - Progress tracking

### Dependencies

```bash
npm install @upstash/redis ioredis
npm install --save-dev @types/ioredis
```

**Package selection:**
- `@upstash/redis`: For serverless/REST API (Vercel, serverless functions)
- `ioredis`: For traditional Redis protocol (Docker, VPS)

### Testing Strategy

1. **Unit Tests**: Test cache get/set/del operations
2. **Integration Tests**: Test rate limiting with Redis
3. **Load Tests**: Verify performance improvement with caching
4. **Fallback Tests**: Ensure app works if Redis is down

### Monitoring

**Metrics to track:**
- Cache hit rate
- Average cache response time
- Rate limit rejections
- Redis connection errors

**Dashboard**: Create Upstash dashboard or use built-in analytics

### Rollout Strategy

1. **Phase 1 (Week 1)**: Deploy Redis, test in staging
2. **Phase 2 (Week 2)**: Enable voice library caching
3. **Phase 3 (Week 3)**: Enable user profile caching
4. **Phase 4 (Week 4)**: Migrate rate limiting to Redis
5. **Phase 5 (Week 5)**: Enable session storage

**Rollback plan**: Feature flags to disable Redis caching

---

## 2. PostHog Integration

### Purpose

- **Product Analytics**: Track user behavior and feature usage
- **Feature Flags**: A/B testing and gradual feature rollouts
- **Session Recording**: Debug user issues with session replays
- **Funnels**: Analyze conversion rates (signup → generation → payment)
- **Cohort Analysis**: Segment users and analyze retention

### Architecture

```
Client (Browser) → PostHog SDK → PostHog Cloud/Self-hosted
Server (API) → PostHog Node SDK → PostHog Cloud/Self-hosted
```

### Configuration

#### Environment Variables

Add to `.env.production`:

```bash
# PostHog Configuration
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_api_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com  # or self-hosted URL

# Server-side PostHog (for API analytics)
POSTHOG_API_KEY=phc_your_project_api_key
POSTHOG_HOST=https://app.posthog.com

# Feature flags
POSTHOG_PERSONAL_API_KEY=phx_your_personal_api_key  # For feature flag evaluation

# Privacy settings
POSTHOG_AUTOCAPTURE=true                  # Auto-capture clicks and pageviews
POSTHOG_CAPTURE_PAGEVIEW=true             # Track pageviews
POSTHOG_CAPTURE_PAGELEAVE=true            # Track page leave events
POSTHOG_SESSION_RECORDING=true            # Enable session recording
POSTHOG_DISABLE_SESSION_RECORDING_FOR_FREE=true  # Privacy: disable for free users
```

#### Getting PostHog Credentials

1. Sign up at https://posthog.com or self-host
2. Create a new project
3. Copy Project API Key from Project Settings
4. Create Personal API Key for server-side feature flags

### Implementation Plan

#### Phase 1: Client-Side Setup

**Files to create:**
- `src/lib/analytics/posthog.ts` - PostHog initialization
- `src/providers/analytics-provider.tsx` - React context provider
- `src/hooks/use-analytics.ts` - Hook for tracking events

**Key implementation points:**
```typescript
// Example structure (DO NOT implement yet)
// src/lib/analytics/posthog.ts
// - Initialize PostHog with API key
// - Configure autocapture and session recording
// - Set up user identification
// - Handle opt-out and privacy settings

// src/hooks/use-analytics.ts
// - trackEvent(eventName, properties)
// - trackPageView(url)
// - identifyUser(userId, properties)
// - resetUser() // on logout
```

**Integration points:**
- `src/app/layout.tsx` - Initialize PostHog provider
- `src/app/(auth)/signin/page.tsx` - Track successful login
- `src/app/(dashboard)/generate/page.tsx` - Track voice generation
- `src/components/ui/button.tsx` - Auto-capture button clicks (optional)

#### Phase 2: Server-Side Tracking

**Use cases:**
1. Track API requests and performance
2. Track background jobs (generation processing)
3. Track server-side events (payment success, credit purchase)

**Files to create:**
- `src/lib/analytics/server.ts` - Server-side PostHog client

**Files to modify:**
- `src/app/api/generate/route.ts` - Track generation requests
- `src/app/api/webhooks/stripe/route.ts` - Track payment events
- `src/lib/ai/provider.ts` - Track AI provider usage

#### Phase 3: Feature Flags

**Use cases:**
1. Gradual rollout of voice cloning feature
2. A/B test different pricing displays
3. Enable beta features for specific users
4. Kill switch for problematic features

**Files to create:**
- `src/lib/feature-flags/client.ts` - Client-side feature flags
- `src/lib/feature-flags/server.ts` - Server-side feature flags
- `src/hooks/use-feature-flag.ts` - React hook for flags

**Example feature flags to implement:**
```typescript
// Feature flag keys (DO NOT implement yet)
// - 'voice-cloning-enabled': Enable voice cloning for user
// - 'new-pricing-page': Show new pricing design
// - 'api-v2-enabled': Enable API v2 endpoints
// - 'batch-processing': Enable batch generation feature
// - 'team-workspaces': Enable team collaboration features
```

#### Phase 4: Analytics Events

**Key events to track:**

**Authentication:**
- `user_signed_up`: User completed signup
- `user_signed_in`: User logged in
- `user_signed_out`: User logged out

**Voice Generation:**
- `generation_started`: User initiated generation
- `generation_completed`: Generation finished successfully
- `generation_failed`: Generation failed
- `generation_downloaded`: User downloaded audio
- `voice_previewed`: User played voice preview

**Payments:**
- `checkout_started`: User clicked upgrade/buy credits
- `checkout_completed`: Payment successful
- `subscription_created`: User subscribed to plan
- `subscription_canceled`: User canceled subscription

**Projects:**
- `project_created`: User created new project
- `project_deleted`: User deleted project
- `project_exported`: User exported project

**API Usage:**
- `api_key_created`: User created API key
- `api_request`: API endpoint called (server-side)

#### Phase 5: Funnels & Cohorts

**Funnels to create:**
1. Signup → First Generation → Upgrade (conversion funnel)
2. Dashboard → Generate Page → Generation Completed
3. Checkout Started → Checkout Completed (payment funnel)

**Cohorts to track:**
1. Free users who generated >10 voices
2. Users who signed up but never generated
3. Users who upgraded within 7 days
4. Power users (>100 generations/month)

### Dependencies

```bash
npm install posthog-js posthog-node
```

### Privacy Considerations

1. **GDPR Compliance**: Add PostHog opt-out in privacy settings
2. **PII Protection**: Don't send emails, passwords, or sensitive data
3. **Session Recording**: Allow users to disable in settings
4. **Data Retention**: Configure in PostHog settings (90 days recommended)

### Testing Strategy

1. Test event tracking in development with PostHog debug mode
2. Verify feature flags work with different user segments
3. Test opt-out functionality
4. Validate server-side events are captured

### Monitoring

**PostHog Dashboards to create:**
1. **Usage Overview**: Daily active users, generations, signups
2. **Conversion Funnel**: Signup to first payment
3. **Feature Usage**: Which features are used most
4. **Performance**: API response times, error rates
5. **Retention**: User retention by cohort

---

## 3. Sentry Integration

### Purpose

- **Error Tracking**: Capture and alert on application errors
- **Performance Monitoring**: Track API response times and slow queries
- **Release Tracking**: Monitor errors by deployment version
- **User Feedback**: Collect user feedback on errors
- **Source Maps**: Debug minified production code

### Architecture

```
Client (Browser) → Sentry Browser SDK → Sentry
Server (API) → Sentry Node SDK → Sentry
Build Pipeline → Upload Source Maps → Sentry
```

### Configuration

#### Environment Variables

Add to `.env.production`:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/123456
SENTRY_AUTH_TOKEN=your_auth_token_for_source_maps

# Environment and release tracking
SENTRY_ENVIRONMENT=production  # or 'staging', 'development'
NEXT_PUBLIC_SENTRY_RELEASE=1.0.0  # Semantic version or git commit SHA

# Performance monitoring
SENTRY_TRACES_SAMPLE_RATE=0.1  # Sample 10% of transactions (adjust based on traffic)
SENTRY_PROFILES_SAMPLE_RATE=0.1  # Profile 10% of transactions

# Error sampling
SENTRY_ERROR_SAMPLE_RATE=1.0  # Capture 100% of errors (lower if high volume)

# Privacy settings
SENTRY_SEND_DEFAULT_PII=false  # Don't send personally identifiable information
SENTRY_BEFORE_SEND_ENABLED=true  # Filter sensitive data before sending
```

#### Getting Sentry Credentials

1. Sign up at https://sentry.io
2. Create a new project (select Next.js)
3. Copy DSN from Project Settings → Client Keys
4. Create Auth Token from Settings → Account → API → Auth Tokens
   - Scope: `project:releases` and `org:read`

### Implementation Plan

#### Phase 1: Basic Setup

**Files to create:**
- `sentry.client.config.ts` - Browser-side Sentry configuration
- `sentry.server.config.ts` - Server-side Sentry configuration
- `sentry.edge.config.ts` - Edge runtime Sentry configuration
- `src/lib/sentry/utils.ts` - Sentry helper functions

**Files to modify:**
- `next.config.js` - Add Sentry webpack plugin for source maps
- `src/app/error.tsx` - Error boundary with Sentry reporting
- `src/app/global-error.tsx` - Global error handler

**Key configuration:**
```typescript
// Example structure (DO NOT implement yet)
// sentry.client.config.ts
// - Initialize Sentry with DSN
// - Set up error filtering (remove sensitive data)
// - Configure breadcrumbs
// - Set user context on authentication
// - Enable performance monitoring

// sentry.server.config.ts
// - Initialize Sentry for server-side
// - Configure integrations (Prisma, http, etc.)
// - Set up server-side performance tracking
```

#### Phase 2: Error Boundaries

**Implementation:**
1. Wrap application in Sentry error boundary
2. Create custom error pages with error reporting
3. Add error boundary to critical components

**Files to modify:**
- `src/app/layout.tsx` - Add Sentry ErrorBoundary
- `src/app/(dashboard)/generate/page.tsx` - Error handling for generation
- `src/components/voice/voice-generator.tsx` - Component-level errors

#### Phase 3: Performance Monitoring

**Use cases:**
1. Track API route performance
2. Monitor database query times
3. Track AI provider response times
4. Monitor page load times

**Files to modify:**
- `src/app/api/*/route.ts` - Wrap API handlers with Sentry tracing
- `src/lib/supabase/server.ts` - Track database query performance
- `src/lib/ai/provider.ts` - Track AI API calls

**Custom instrumentation:**
```typescript
// Example (DO NOT implement yet)
// Track custom operations:
// - Voice generation duration
// - Database query performance
// - External API calls (OpenAI, Stripe, etc.)
// - File uploads to storage
```

#### Phase 4: User Context & Breadcrumbs

**User context to include:**
- User ID (anonymized)
- User role (free, pro, enterprise)
- Subscription status
- Credits balance (rounded)
- Last activity timestamp

**Breadcrumbs to track:**
- Page navigation
- Button clicks (important actions only)
- API requests
- Generation lifecycle (initiated, processing, completed)
- Credit transactions

**Files to modify:**
- `src/lib/supabase/server.ts` - Set user context on authentication
- `src/app/api/generate/route.ts` - Add generation breadcrumbs

#### Phase 5: Source Maps & Releases

**Setup:**
1. Configure Next.js to generate source maps
2. Upload source maps to Sentry during build
3. Track releases by git commit or version number

**Files to modify:**
- `next.config.js` - Enable source maps for production
- `package.json` - Add Sentry release script

**Build script example:**
```bash
# This will be added to CI/CD pipeline
# sentry-cli releases new "$RELEASE_VERSION"
# sentry-cli releases files "$RELEASE_VERSION" upload-sourcemaps .next/
# sentry-cli releases finalize "$RELEASE_VERSION"
```

#### Phase 6: Alerts & Integrations

**Alerts to configure:**
1. New error types (not seen before)
2. Error spike (>10x normal rate)
3. High error rate (>5% of requests)
4. Performance degradation (API >2s response time)
5. Credit system failures (critical)

**Integrations:**
- Slack: Real-time error notifications
- Email: Daily/weekly error summaries
- PagerDuty: For critical production errors

### Dependencies

```bash
npm install @sentry/nextjs
```

**Note**: Use `@sentry/nextjs` - it includes browser, server, and edge configurations.

### Data Filtering

**Sensitive data to filter before sending to Sentry:**
- API keys
- Passwords
- Email addresses (hash or redact)
- Credit card information
- Full user profiles
- OAuth tokens

**Implementation:**
```typescript
// Example beforeSend function (DO NOT implement yet)
// Filter sensitive data from:
// - Error messages
// - Stack traces
// - Request headers (Authorization, Cookie)
// - Request/response bodies
// - User context
```

### Testing Strategy

1. **Error Testing**: Trigger test errors in development
2. **Performance Testing**: Monitor transaction sampling
3. **Source Maps**: Verify stack traces are readable
4. **Filtering**: Confirm sensitive data is not sent
5. **Alerts**: Test alert rules with simulated errors

### Monitoring & Dashboards

**Sentry dashboards to create:**
1. **Error Overview**: Total errors, affected users, error rate
2. **API Performance**: P50, P95, P99 response times by endpoint
3. **Release Health**: Error rate by release version
4. **User Impact**: Most affected users, error distribution
5. **Critical Errors**: Payment failures, generation failures

**Metrics to track:**
- Apdex score (application performance index)
- Error-free sessions rate
- Most common errors
- Slowest API endpoints
- Error rate by user tier (free vs pro vs enterprise)

---

## 4. Stripe Integration Enhancement

### Current State

Stripe is already partially integrated:
- Payment processing configured
- Webhook handling exists
- Basic subscription management

### Enhancement Plan

#### Phase 1: Webhook Improvements

**Current file**: `src/app/api/webhooks/stripe/route.ts`

**Enhancements needed:**
1. Add more webhook event handlers
2. Improve error handling and retry logic
3. Add webhook signature verification
4. Implement idempotency for webhook processing

**New events to handle:**
- `customer.subscription.paused`
- `customer.subscription.resumed`
- `invoice.payment_failed`
- `invoice.upcoming` (for payment reminders)
- `customer.subscription.trial_will_end`
- `payment_intent.payment_failed`

#### Phase 2: Subscription Management

**Files to create:**
- `src/lib/stripe/subscriptions.ts` - Subscription CRUD operations
- `src/app/api/subscriptions/route.ts` - Subscription API endpoints
- `src/app/api/subscriptions/cancel/route.ts` - Cancel endpoint
- `src/app/api/subscriptions/update/route.ts` - Update plan endpoint

**Features to implement:**
1. Self-service plan upgrades/downgrades
2. Subscription pause/resume
3. Cancel at period end
4. Immediate cancellation with prorated refund
5. Trial period management

#### Phase 3: Usage-Based Billing

**Use case**: Charge based on characters generated (beyond monthly quota)

**Implementation:**
1. Create usage-based price in Stripe
2. Report usage via Stripe API after each generation
3. Invoice users monthly for overages

**Files to create:**
- `src/lib/stripe/usage-reporting.ts` - Report usage to Stripe

#### Phase 4: Customer Portal

**Implementation:**
1. Generate Stripe Customer Portal links
2. Allow users to manage payment methods
3. View invoices and billing history
4. Update billing information

**Files to create:**
- `src/app/api/billing/portal/route.ts` - Generate portal link
- `src/app/(dashboard)/settings/billing/page.tsx` - Billing settings page

#### Phase 5: Payment Analytics

**Metrics to track:**
1. Monthly Recurring Revenue (MRR)
2. Churn rate
3. Customer Lifetime Value (LTV)
4. Failed payment recovery rate
5. Upgrade/downgrade rates

**Integration**: Send payment events to PostHog for combined analytics

### Configuration Updates

Add to `.env.production`:

```bash
# Stripe enhanced features
STRIPE_ENABLE_USAGE_BILLING=true
STRIPE_ENABLE_TAX_CALCULATION=true
STRIPE_BILLING_CYCLE_ANCHOR=true  # Align billing dates

# Stripe Customer Portal
STRIPE_CUSTOMER_PORTAL_URL=https://billing.stripe.com/p/login/...

# Stripe Test Mode (for staging)
STRIPE_TEST_MODE=false  # Set true in staging
```

### Testing Strategy

1. Use Stripe test mode in development
2. Test all webhook events with Stripe CLI
3. Test subscription lifecycle (create, upgrade, downgrade, cancel)
4. Test payment failure scenarios
5. Test usage reporting accuracy

---

## 5. Loops Integration

### Purpose

- **Email Marketing**: Send newsletters, feature announcements
- **Transactional Emails**: Welcome emails, generation notifications
- **Drip Campaigns**: Onboarding sequence, re-engagement
- **Segmentation**: Target users by behavior and attributes
- **Email Analytics**: Track open rates, click rates, conversions

### Why Loops?

- Simple API designed for SaaS products
- Better segmentation than basic transactional email services
- Built-in templates and campaign management
- Affordable pricing
- Integrates well with transactional emails

### Architecture

```
Application Events → Loops API → Email Delivery
     ↓
Events:
  - User signup → Welcome series
  - First generation → Tips & tricks
  - Inactive 7 days → Re-engagement
  - Credit low → Upsell email
  - Subscription ending → Renewal reminder
```

### Configuration

#### Environment Variables

Add to `.env.production`:

```bash
# Loops Email Marketing Configuration
LOOPS_API_KEY=your_loops_api_key
LOOPS_ENABLED=true

# Transactional email routing
EMAIL_MARKETING_PROVIDER=loops  # 'loops' or 'resend'
EMAIL_TRANSACTIONAL_PROVIDER=resend  # Keep Resend for transactional

# Email preferences
LOOPS_DEFAULT_FROM_EMAIL=noreply@smartcamp.ai
LOOPS_DEFAULT_FROM_NAME=SmartCamp.AI

# Campaign IDs (created in Loops dashboard)
LOOPS_CAMPAIGN_WELCOME=campaign_welcome_abc123
LOOPS_CAMPAIGN_ONBOARDING=campaign_onboarding_xyz789
LOOPS_CAMPAIGN_REENGAGEMENT=campaign_reengagement_def456
LOOPS_CAMPAIGN_UPGRADE_PROMPT=campaign_upgrade_ghi789
```

#### Getting Loops Credentials

1. Sign up at https://loops.so
2. Go to Settings → API Keys
3. Create a new API key
4. Verify your sending domain

### Implementation Plan

#### Phase 1: Basic Integration

**Files to create:**
- `src/lib/loops/client.ts` - Loops API client
- `src/lib/loops/contacts.ts` - Contact management
- `src/lib/loops/events.ts` - Event tracking
- `src/lib/loops/types.ts` - TypeScript types

**Key functions:**
```typescript
// Example structure (DO NOT implement yet)
// src/lib/loops/client.ts
// - Initialize Loops client
// - Handle API errors with retry logic

// src/lib/loops/contacts.ts
// - createContact(email, properties)
// - updateContact(email, properties)
// - deleteContact(email)
// - addToSegment(email, segmentId)

// src/lib/loops/events.ts
// - sendEvent(email, eventName, properties)
// - trackUserAction(userId, action, metadata)
```

#### Phase 2: Contact Syncing

**Use case**: Sync users to Loops with attributes for segmentation

**User attributes to sync:**
- Email (identifier)
- Name
- Signup date
- User role (free, pro, enterprise)
- Total generations count
- Total credits purchased
- Last generation date
- Subscription status
- Favorite voice

**Files to modify:**
- `src/app/api/auth/callback/route.ts` - Sync new users to Loops
- `src/lib/supabase/admin.ts` - Sync on credit purchases, upgrades

**Sync triggers:**
1. User signs up → Create contact
2. User upgrades → Update contact attributes
3. User generates voice → Update generation count
4. User purchases credits → Update purchases count

#### Phase 3: Transactional Email Templates

**Email templates to create in Loops:**

1. **Welcome Email** (`welcome`)
   - Sent: Immediately after signup
   - Content: Welcome message, getting started guide
   - CTA: Generate your first voice

2. **First Generation Complete** (`first_generation_complete`)
   - Sent: After first successful generation
   - Content: Tips for better results, advanced features
   - CTA: Create a project

3. **Onboarding Series** (`onboarding_day_1`, `onboarding_day_3`, `onboarding_day_7`)
   - Sent: Drip series over 7 days
   - Content: Feature highlights, use cases, tips
   - CTA: Try premium voices, upgrade

4. **Credit Low Warning** (`credit_low`)
   - Sent: When credits < 1000
   - Content: Low credit notification
   - CTA: Purchase credits or upgrade

5. **Generation Complete** (`generation_complete`)
   - Sent: When generation finishes (optional, can be noisy)
   - Content: Your voice is ready
   - CTA: Download audio

6. **Subscription Renewal** (`subscription_renewal`)
   - Sent: 3 days before renewal
   - Content: Upcoming charge notification
   - CTA: Update payment method

7. **Re-engagement** (`reengagement`)
   - Sent: After 14 days of inactivity
   - Content: We miss you, new features
   - CTA: Come back and generate

**Files to modify:**
- `src/lib/email/client.ts` - Route marketing emails to Loops
- `src/app/api/webhooks/stripe/route.ts` - Trigger subscription emails

#### Phase 4: Drip Campaigns

**Campaign 1: Onboarding (7 days)**
- Day 0: Welcome email (sent via auth callback)
- Day 1: How to choose the right voice
- Day 3: Advanced features (speed, pitch, emotions)
- Day 5: Use cases and examples
- Day 7: Upgrade prompt with discount

**Campaign 2: Re-engagement (Triggered)**
- Trigger: No generation in 14 days
- Email 1: We miss you (Day 14)
- Email 2: New features announcement (Day 21)
- Email 3: Special offer (Day 28)

**Campaign 3: Upgrade Nurture (Triggered)**
- Trigger: Free user with >5 generations
- Email 1: Unlock premium voices (Day 1)
- Email 2: API access benefits (Day 3)
- Email 3: Limited time discount (Day 7)

#### Phase 5: Segmentation

**Segments to create:**

1. **Free Users**: role = 'free'
2. **Pro Users**: role = 'pro'
3. **Enterprise Users**: role = 'enterprise'
4. **Active Users**: Last generation < 7 days
5. **Inactive Users**: Last generation > 14 days
6. **Power Users**: Generations count > 100
7. **At-Risk Users**: Free, >5 generations, no upgrade
8. **Recent Signups**: Signup date < 7 days

**Files to create:**
- `src/lib/loops/segments.ts` - Segment management and sync

#### Phase 6: Email Analytics

**Metrics to track:**
1. Email open rates by campaign
2. Click-through rates
3. Conversion rates (email → action)
4. Unsubscribe rates
5. Bounce rates

**Integration**: Pull Loops analytics into PostHog or admin dashboard

**Files to create:**
- `src/app/api/analytics/email/route.ts` - Fetch Loops analytics
- `src/app/(dashboard)/admin/email-analytics/page.tsx` - Dashboard view

### Dependencies

```bash
npm install axios  # For Loops API requests (or use fetch)
```

**Note**: Loops doesn't have an official Node.js SDK, use REST API directly.

### Email Best Practices

1. **Double Opt-In**: Confirm email before adding to marketing lists
2. **Unsubscribe Link**: Always include in marketing emails
3. **Personalization**: Use user name and relevant data
4. **A/B Testing**: Test subject lines and content
5. **Timing**: Send emails at optimal times (avoid weekends)
6. **Frequency Capping**: Don't over-email users

### Testing Strategy

1. Test email rendering in multiple clients (Gmail, Outlook, Apple Mail)
2. Test unsubscribe flow
3. Test contact syncing accuracy
4. Verify event tracking works correctly
5. Test drip campaign timing

### Privacy & Compliance

1. **GDPR**: Allow users to export/delete their data
2. **CAN-SPAM**: Include physical address and unsubscribe
3. **Opt-out**: Respect user email preferences
4. **Data Minimization**: Only sync necessary user data

**Files to create:**
- `src/app/(dashboard)/settings/email-preferences/page.tsx` - User email settings
- `src/lib/loops/privacy.ts` - GDPR compliance functions

---

## Integration Timeline

### Month 1: Foundation
- **Week 1**: Upstash Redis setup and basic caching
- **Week 2**: PostHog integration and basic analytics
- **Week 3**: Sentry error tracking
- **Week 4**: Testing and refinement

### Month 2: Advanced Features
- **Week 1**: Redis rate limiting and session storage
- **Week 2**: PostHog feature flags and funnels
- **Week 3**: Sentry performance monitoring
- **Week 4**: Loops basic integration

### Month 3: Email & Payments
- **Week 1**: Loops drip campaigns
- **Week 2**: Loops segmentation and analytics
- **Week 3**: Stripe subscription enhancements
- **Week 4**: Stripe usage-based billing

### Month 4: Optimization
- **Week 1**: Performance optimization with Redis
- **Week 2**: Analytics dashboards and reporting
- **Week 3**: Email campaign optimization
- **Week 4**: Final testing and launch

## Success Metrics

### Upstash Redis
- Cache hit rate >70%
- API response time improvement >30%
- Rate limiting accuracy 100%

### PostHog
- 100% of key events tracked
- Feature flag latency <50ms
- >5 active dashboards

### Sentry
- Error detection rate 100%
- False positive rate <5%
- Mean time to resolution <4 hours

### Stripe
- Payment success rate >95%
- Webhook processing time <1s
- Failed payment recovery rate >40%

### Loops
- Email deliverability >98%
- Open rate >25%
- Click rate >5%
- Unsubscribe rate <2%

## Cost Estimates

| Service | Plan | Monthly Cost | Notes |
|---------|------|--------------|-------|
| Upstash Redis | Pay-as-you-go | $10-50 | Based on 100k-1M requests |
| PostHog | Startup | $0-50 | Free up to 1M events |
| Sentry | Team | $26+ | $26/month + $0.00045/error |
| Stripe | Standard | 2.9% + $0.30 | Per transaction |
| Loops | Growth | $150 | Up to 50k contacts |
| **Total** | | **$186-276/month** | Scales with usage |

## Rollback Plans

Each integration should have a feature flag to disable if issues arise:

```bash
# Feature flags for integrations
ENABLE_REDIS_CACHE=true
ENABLE_POSTHOG=true
ENABLE_SENTRY=true
ENABLE_LOOPS=true
```

If any service fails:
1. Set feature flag to `false`
2. Application falls back to existing functionality
3. No downtime for users

---

## Next Steps

1. Review this plan with the team
2. Create accounts for each service
3. Set up staging environments
4. Begin implementation following the phased approach
5. Monitor metrics and iterate

For implementation, follow the phases outlined for each service. Start with Upstash Redis and PostHog as they provide immediate value.

---

**Document Version**: 1.0.0
**Last Updated**: 2025-11-21
**Status**: Planning - No code changes made
