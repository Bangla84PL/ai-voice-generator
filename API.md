# AI Voice Generator - API Documentation

Complete API reference for the SmartCamp.AI Voice Generator platform.

**Base URL**: `https://voice.smartcamp.ai/api`

**API Version**: v1

---

## Table of Contents

- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Voice Generation](#voice-generation-endpoints)
  - [Projects](#projects-endpoints)
  - [Voices](#voices-endpoints)
  - [Credits](#credits-endpoints)
  - [Subscriptions](#subscriptions-endpoints)
  - [API Keys](#api-keys-endpoints)
  - [History](#history-endpoints)
  - [Webhooks](#webhooks-endpoints)
  - [Utility](#utility-endpoints)
- [Webhooks](#outgoing-webhooks)
- [Code Examples](#code-examples)

---

## Authentication

The API supports two authentication methods:

### 1. JWT Token (Browser/Session-based)

Used for web application access. Tokens are automatically managed by Supabase Auth.

```http
GET /api/generate/123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. API Key (Server-to-Server)

Used for programmatic access (Pro and Enterprise tiers only).

```http
GET /api/generate/123
Authorization: Bearer vg_live_1234567890abcdef
```

**API Key Format**: `vg_live_` + 32 character alphanumeric string

### Getting an API Key

1. Sign in to your account
2. Navigate to Settings → API Keys
3. Click "Create New API Key"
4. Save the key securely (shown only once)

---

## Rate Limiting

Rate limits vary by authentication method and tier:

| Tier | JWT Auth | API Key | Concurrent Generations |
|------|----------|---------|------------------------|
| Free | 100 req/min | N/A | 2 |
| Pro | 100 req/min | 1000 req/hour | 10 |
| Enterprise | 200 req/min | 5000 req/hour | 50 |

**Rate Limit Headers**:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

**Rate Limit Exceeded Response**:
```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Please try again in 23 seconds.",
    "details": {
      "limit": 100,
      "reset_at": "2025-11-18T12:30:00Z"
    }
  }
}
```

---

## Error Handling

All errors follow a consistent format:

### Error Response Structure

```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    }
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Common Error Codes

| Code | Description |
|------|-------------|
| `invalid_request` | Malformed request body |
| `authentication_required` | No authentication provided |
| `invalid_token` | Invalid or expired token |
| `insufficient_credits` | Not enough credits for operation |
| `resource_not_found` | Resource doesn't exist |
| `rate_limit_exceeded` | Too many requests |
| `validation_error` | Input validation failed |
| `generation_failed` | Voice generation failed |
| `provider_error` | AI provider error |

---

## Endpoints

### Authentication Endpoints

#### Sign Up

```http
POST /api/auth/signup
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe"
}
```

**Response** (201):
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "credits_balance": 10000,
    "created_at": "2025-11-18T10:00:00Z"
  },
  "session": {
    "access_token": "eyJhbGci...",
    "refresh_token": "eyJhbGci...",
    "expires_at": 1700000000
  }
}
```

---

#### Log In

```http
POST /api/auth/login
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200):
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "pro",
    "credits_balance": 450000
  },
  "session": {
    "access_token": "eyJhbGci...",
    "refresh_token": "eyJhbGci...",
    "expires_at": 1700000000
  }
}
```

---

#### Log Out

```http
POST /api/auth/logout
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "message": "Successfully logged out"
}
```

---

#### Reset Password

```http
POST /api/auth/reset-password
```

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200):
```json
{
  "message": "Password reset email sent"
}
```

---

### Voice Generation Endpoints

#### Create Generation

```http
POST /api/generate
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "text": "Hello, this is a test of the AI voice generation system.",
  "voice_id": "550e8400-e29b-41d4-a716-446655440001",
  "project_id": "550e8400-e29b-41d4-a716-446655440002",
  "settings": {
    "speed": 1.0,
    "pitch": 0,
    "tone": "professional",
    "format": "mp3",
    "quality": "high"
  }
}
```

**Parameters**:
- `text` (required): Text to convert (max 10,000 characters)
- `voice_id` (required): UUID of the voice profile
- `project_id` (optional): UUID of the project
- `settings` (optional): Voice generation settings
  - `speed`: 0.5 - 2.0 (default: 1.0)
  - `pitch`: -20 to +20 (default: 0)
  - `tone`: "neutral" | "excited" | "calm" | "professional" (default: "neutral")
  - `format`: "mp3" | "wav" | "ogg" (default: "mp3")
  - `quality`: "standard" | "high" | "premium" (default: "high")

**Response** (201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "project_id": "550e8400-e29b-41d4-a716-446655440002",
  "text": "Hello, this is a test...",
  "character_count": 51,
  "voice_id": "550e8400-e29b-41d4-a716-446655440001",
  "voice_name": "Professional Male (US)",
  "settings": {
    "speed": 1.0,
    "pitch": 0,
    "tone": "professional",
    "format": "mp3",
    "quality": "high"
  },
  "status": "processing",
  "credits_used": 51,
  "created_at": "2025-11-18T10:15:00Z",
  "estimated_completion": "2025-11-18T10:15:30Z"
}
```

---

#### Get Generation Status

```http
GET /api/generate/{id}
Authorization: Bearer {token}
```

**Response** (200) - Processing:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "status": "processing",
  "progress": 45,
  "created_at": "2025-11-18T10:15:00Z",
  "estimated_completion": "2025-11-18T10:15:30Z"
}
```

**Response** (200) - Completed:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "status": "completed",
  "audio_url": "https://api.supabase.smartcamp.ai/storage/v1/object/sign/voicegen-audio/550e8400.../audio.mp3?token=...",
  "audio_duration": 3.5,
  "character_count": 51,
  "credits_used": 51,
  "created_at": "2025-11-18T10:15:00Z",
  "completed_at": "2025-11-18T10:15:25Z"
}
```

**Response** (200) - Failed:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "status": "failed",
  "error_message": "AI provider temporarily unavailable",
  "created_at": "2025-11-18T10:15:00Z",
  "failed_at": "2025-11-18T10:15:10Z"
}
```

---

#### Download Audio

```http
GET /api/generate/{id}/download
Authorization: Bearer {token}
```

**Response** (200):
- Content-Type: `audio/mpeg` (for MP3)
- Content-Disposition: `attachment; filename="generation-{id}.mp3"`
- Binary audio data

---

#### Delete Generation

```http
DELETE /api/generate/{id}
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "message": "Generation deleted successfully"
}
```

---

### Projects Endpoints

#### List Projects

```http
GET /api/projects
Authorization: Bearer {token}
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: "created_at" | "updated_at" | "name" (default: "created_at")
- `order`: "asc" | "desc" (default: "desc")

**Response** (200):
```json
{
  "projects": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Podcast Episodes",
      "description": "Weekly podcast voice-overs",
      "settings": {
        "default_voice_id": "550e8400-e29b-41d4-a716-446655440001",
        "default_speed": 1.0
      },
      "generation_count": 15,
      "created_at": "2025-11-01T10:00:00Z",
      "updated_at": "2025-11-18T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "total_pages": 1
  }
}
```

---

#### Create Project

```http
POST /api/projects
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "name": "Marketing Videos",
  "description": "Voice-overs for product marketing",
  "settings": {
    "default_voice_id": "550e8400-e29b-41d4-a716-446655440001",
    "default_speed": 1.1,
    "default_tone": "excited"
  }
}
```

**Response** (201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "name": "Marketing Videos",
  "description": "Voice-overs for product marketing",
  "settings": {
    "default_voice_id": "550e8400-e29b-41d4-a716-446655440001",
    "default_speed": 1.1,
    "default_tone": "excited"
  },
  "generation_count": 0,
  "created_at": "2025-11-18T10:20:00Z",
  "updated_at": "2025-11-18T10:20:00Z"
}
```

---

#### Get Project

```http
GET /api/projects/{id}
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "name": "Podcast Episodes",
  "description": "Weekly podcast voice-overs",
  "settings": {
    "default_voice_id": "550e8400-e29b-41d4-a716-446655440001",
    "default_speed": 1.0
  },
  "generation_count": 15,
  "created_at": "2025-11-01T10:00:00Z",
  "updated_at": "2025-11-18T10:00:00Z"
}
```

---

#### Update Project

```http
PATCH /api/projects/{id}
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "name": "Podcast Episodes - Season 2",
  "description": "Updated description"
}
```

**Response** (200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "name": "Podcast Episodes - Season 2",
  "description": "Updated description",
  "settings": {...},
  "generation_count": 15,
  "created_at": "2025-11-01T10:00:00Z",
  "updated_at": "2025-11-18T10:25:00Z"
}
```

---

#### Delete Project

```http
DELETE /api/projects/{id}
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "message": "Project deleted successfully"
}
```

---

#### List Project Generations

```http
GET /api/projects/{id}/generations
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "generations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "text": "Episode 1: Introduction to AI...",
      "character_count": 1250,
      "voice_name": "Professional Male (US)",
      "status": "completed",
      "audio_url": "https://...",
      "created_at": "2025-11-18T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

### Voices Endpoints

#### List Voices

```http
GET /api/voices
Authorization: Bearer {token}
```

**Query Parameters**:
- `language`: Filter by language code (e.g., "en", "es", "fr")
- `gender`: Filter by gender ("male", "female", "neutral")
- `age`: Filter by age ("young", "adult", "senior")
- `accent`: Filter by accent (e.g., "US", "UK", "AU")
- `premium`: Filter premium voices ("true" or "false")
- `search`: Search by name or description
- `tags`: Comma-separated tags
- `page`: Page number
- `limit`: Items per page

**Response** (200):
```json
{
  "voices": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Professional Male (US)",
      "provider": "openai",
      "provider_voice_id": "alloy",
      "gender": "male",
      "age": "adult",
      "accent": "US",
      "language": "en",
      "description": "Clear, professional male voice with American accent",
      "sample_url": "https://api.supabase.smartcamp.ai/storage/v1/object/public/voicegen-voice-samples/alloy-sample.mp3",
      "tags": ["professional", "clear", "business"],
      "is_premium": false,
      "is_active": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 52,
    "total_pages": 2
  }
}
```

---

#### Get Voice

```http
GET /api/voices/{id}
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Professional Male (US)",
  "provider": "openai",
  "gender": "male",
  "age": "adult",
  "accent": "US",
  "language": "en",
  "description": "Clear, professional male voice with American accent",
  "sample_url": "https://...",
  "tags": ["professional", "clear", "business"],
  "is_premium": false,
  "is_active": true,
  "created_at": "2025-10-01T00:00:00Z"
}
```

---

#### Create Custom Voice (Pro+)

```http
POST /api/voices/custom
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data**:
- `name`: Voice name
- `description`: Voice description
- `sample_audio`: Audio file (min 30s, WAV/MP3, max 50MB)

**Response** (201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440050",
  "name": "My Custom Voice",
  "status": "training",
  "estimated_completion": "2025-11-18T11:00:00Z",
  "created_at": "2025-11-18T10:30:00Z"
}
```

---

#### List Custom Voices (Pro+)

```http
GET /api/voices/custom
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "custom_voices": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440050",
      "name": "My Custom Voice",
      "status": "ready",
      "sample_audio_url": "https://...",
      "created_at": "2025-11-18T10:30:00Z"
    }
  ]
}
```

---

### Credits Endpoints

#### Get Credit Balance

```http
GET /api/credits/balance
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "balance": 245680,
  "tier": "pro",
  "monthly_limit": 500000,
  "used_this_month": 254320,
  "resets_at": "2025-12-01T00:00:00Z"
}
```

---

#### Get Credit Transactions

```http
GET /api/credits/transactions
Authorization: Bearer {token}
```

**Query Parameters**:
- `page`: Page number
- `limit`: Items per page
- `type`: Filter by type ("purchase", "subscription", "generation", "refund", "bonus")
- `start_date`: Filter from date (ISO 8601)
- `end_date`: Filter to date (ISO 8601)

**Response** (200):
```json
{
  "transactions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "amount": -51,
      "type": "generation",
      "description": "Voice generation: 51 characters",
      "reference_id": "550e8400-e29b-41d4-a716-446655440003",
      "balance_after": 245680,
      "created_at": "2025-11-18T10:15:25Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440101",
      "amount": 500000,
      "type": "subscription",
      "description": "Pro subscription renewal - November 2025",
      "balance_after": 500000,
      "created_at": "2025-11-01T00:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

#### Purchase Credits

```http
POST /api/credits/purchase
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "pack": "100k"
}
```

**Available Packs**:
- `100k`: 100,000 credits for $5
- `500k`: 500,000 credits for $20
- `1m`: 1,000,000 credits for $35

**Response** (200):
```json
{
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "session_id": "cs_test_a1b2c3..."
}
```

---

### Subscriptions Endpoints

#### Get Subscription

```http
GET /api/subscriptions
Authorization: Bearer {token}
```

**Response** (200) - Active:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440200",
  "plan": "pro",
  "status": "active",
  "current_period_start": "2025-11-01T00:00:00Z",
  "current_period_end": "2025-12-01T00:00:00Z",
  "cancel_at_period_end": false,
  "stripe_subscription_id": "sub_1234567890",
  "monthly_credits": 500000,
  "created_at": "2025-10-01T00:00:00Z"
}
```

**Response** (200) - No Subscription:
```json
{
  "plan": "free",
  "status": "active",
  "monthly_credits": 10000
}
```

---

#### Create Subscription Checkout

```http
POST /api/subscriptions/checkout
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "plan": "pro"
}
```

**Available Plans**:
- `pro`: $19/month, 500k credits/month
- `enterprise`: $99/month, unlimited credits

**Response** (200):
```json
{
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "session_id": "cs_test_a1b2c3..."
}
```

---

#### Cancel Subscription

```http
POST /api/subscriptions/cancel
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "immediate": false
}
```

**Response** (200):
```json
{
  "message": "Subscription will be canceled at the end of the current billing period",
  "cancel_at": "2025-12-01T00:00:00Z"
}
```

---

#### Resume Subscription

```http
POST /api/subscriptions/resume
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "message": "Subscription cancellation has been reversed",
  "status": "active"
}
```

---

### API Keys Endpoints

#### List API Keys (Pro+)

```http
GET /api/keys
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "api_keys": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440300",
      "name": "Production Server",
      "key_prefix": "vg_live_",
      "last_used_at": "2025-11-18T09:00:00Z",
      "is_active": true,
      "created_at": "2025-11-01T10:00:00Z"
    }
  ]
}
```

---

#### Create API Key (Pro+)

```http
POST /api/keys
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "name": "Production Server"
}
```

**Response** (201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440300",
  "name": "Production Server",
  "key": "vg_live_1234567890abcdef1234567890abcdef",
  "created_at": "2025-11-18T10:35:00Z",
  "warning": "This key will only be shown once. Please save it securely."
}
```

---

#### Revoke API Key (Pro+)

```http
DELETE /api/keys/{id}
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "message": "API key revoked successfully"
}
```

---

### History Endpoints

#### Get Generation History

```http
GET /api/history
Authorization: Bearer {token}
```

**Query Parameters**:
- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status ("pending", "processing", "completed", "failed")
- `project_id`: Filter by project
- `start_date`: Filter from date
- `end_date`: Filter to date
- `sort`: "created_at" | "character_count" (default: "created_at")
- `order`: "asc" | "desc" (default: "desc")

**Response** (200):
```json
{
  "generations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "text": "Hello, this is a test...",
      "character_count": 51,
      "voice_name": "Professional Male (US)",
      "project_name": "Podcast Episodes",
      "status": "completed",
      "audio_url": "https://...",
      "audio_duration": 3.5,
      "credits_used": 51,
      "created_at": "2025-11-18T10:15:00Z",
      "completed_at": "2025-11-18T10:15:25Z"
    }
  ],
  "pagination": {...},
  "summary": {
    "total_generations": 125,
    "total_credits_used": 156780,
    "total_duration": 8965.5
  }
}
```

---

### Webhooks Endpoints

#### Stripe Webhook Handler

```http
POST /api/webhooks/stripe
Stripe-Signature: t=1700000000,v1=abc123...
```

**Events Handled**:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Response** (200):
```json
{
  "received": true
}
```

---

#### n8n Callback Handler

```http
POST /api/webhooks/n8n
X-Webhook-Secret: your-webhook-secret
```

**Request Body**:
```json
{
  "event": "generation.completed",
  "data": {
    "generation_id": "550e8400-e29b-41d4-a716-446655440003"
  }
}
```

**Response** (200):
```json
{
  "received": true
}
```

---

### Utility Endpoints

#### Health Check

```http
GET /api/health
```

**Response** (200):
```json
{
  "status": "ok",
  "timestamp": "2025-11-18T10:40:00Z",
  "version": "1.0.0",
  "services": {
    "database": "ok",
    "storage": "ok",
    "ai_provider": "ok"
  }
}
```

---

#### User Statistics

```http
GET /api/stats
Authorization: Bearer {token}
```

**Response** (200):
```json
{
  "total_generations": 125,
  "total_characters": 156780,
  "total_duration": 8965.5,
  "credits_used_this_month": 254320,
  "favorite_voice": "Professional Male (US)",
  "most_active_project": "Podcast Episodes",
  "account_age_days": 48
}
```

---

## Outgoing Webhooks

Configure webhooks to receive real-time notifications for events.

### n8n Webhook Integrations

#### User Onboarding

**URL**: `https://n8n.smartcamp.ai/webhook/user-onboarding`

**Trigger**: New user signs up

**Payload**:
```json
{
  "event": "user.created",
  "timestamp": "2025-11-18T10:00:00Z",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "credits_balance": 10000,
    "created_at": "2025-11-18T10:00:00Z"
  }
}
```

---

#### Generation Complete

**URL**: `https://n8n.smartcamp.ai/webhook/generation-complete`

**Trigger**: Voice generation completes successfully

**Payload**:
```json
{
  "event": "generation.completed",
  "timestamp": "2025-11-18T10:15:25Z",
  "data": {
    "generation_id": "550e8400-e29b-41d4-a716-446655440003",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "character_count": 51,
    "credits_used": 51,
    "audio_url": "https://...",
    "audio_duration": 3.5
  }
}
```

---

#### Credit Threshold Alert

**URL**: `https://n8n.smartcamp.ai/webhook/credit-threshold`

**Trigger**: User reaches 80%, 90%, or 100% of monthly credits

**Payload**:
```json
{
  "event": "credits.threshold_reached",
  "timestamp": "2025-11-18T14:00:00Z",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "threshold": 90,
    "credits_balance": 50000,
    "monthly_limit": 500000
  }
}
```

---

#### Subscription Changed

**URL**: `https://n8n.smartcamp.ai/webhook/subscription-changed`

**Trigger**: Subscription created, updated, or canceled

**Payload**:
```json
{
  "event": "subscription.updated",
  "timestamp": "2025-11-18T12:00:00Z",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "subscription_id": "550e8400-e29b-41d4-a716-446655440200",
    "plan": "pro",
    "status": "active",
    "previous_plan": "free"
  }
}
```

---

## Code Examples

### JavaScript/TypeScript (Node.js)

```typescript
import axios from 'axios';

const API_BASE_URL = 'https://voice.smartcamp.ai/api';
const API_KEY = 'vg_live_1234567890abcdef1234567890abcdef';

// Create a voice generation
async function generateVoice(text: string, voiceId: string) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/generate`,
      {
        text,
        voice_id: voiceId,
        settings: {
          speed: 1.0,
          format: 'mp3',
          quality: 'high',
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const generationId = response.data.id;
    console.log('Generation created:', generationId);

    // Poll for completion
    return await pollGenerationStatus(generationId);
  } catch (error) {
    console.error('Error generating voice:', error.response?.data);
    throw error;
  }
}

// Poll for generation status
async function pollGenerationStatus(generationId: string) {
  const maxAttempts = 60;
  const pollInterval = 2000; // 2 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await axios.get(
      `${API_BASE_URL}/generate/${generationId}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      }
    );

    const { status, audio_url, error_message } = response.data;

    if (status === 'completed') {
      console.log('Generation completed:', audio_url);
      return response.data;
    } else if (status === 'failed') {
      throw new Error(`Generation failed: ${error_message}`);
    }

    // Wait before polling again
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Generation timed out');
}

// Example usage
generateVoice(
  'Hello, welcome to SmartCamp.AI Voice Generator!',
  '550e8400-e29b-41d4-a716-446655440001'
)
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Error:', error));
```

---

### Python

```python
import requests
import time

API_BASE_URL = 'https://voice.smartcamp.ai/api'
API_KEY = 'vg_live_1234567890abcdef1234567890abcdef'

def generate_voice(text, voice_id):
    """Create a voice generation"""

    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }

    payload = {
        'text': text,
        'voice_id': voice_id,
        'settings': {
            'speed': 1.0,
            'format': 'mp3',
            'quality': 'high'
        }
    }

    response = requests.post(
        f'{API_BASE_URL}/generate',
        json=payload,
        headers=headers
    )

    response.raise_for_status()
    data = response.json()
    generation_id = data['id']

    print(f'Generation created: {generation_id}')

    # Poll for completion
    return poll_generation_status(generation_id)

def poll_generation_status(generation_id):
    """Poll for generation completion"""

    headers = {
        'Authorization': f'Bearer {API_KEY}'
    }

    max_attempts = 60
    poll_interval = 2  # seconds

    for attempt in range(max_attempts):
        response = requests.get(
            f'{API_BASE_URL}/generate/{generation_id}',
            headers=headers
        )

        response.raise_for_status()
        data = response.json()

        status = data['status']

        if status == 'completed':
            print(f"Generation completed: {data['audio_url']}")
            return data
        elif status == 'failed':
            raise Exception(f"Generation failed: {data.get('error_message')}")

        time.sleep(poll_interval)

    raise Exception('Generation timed out')

# Example usage
if __name__ == '__main__':
    try:
        result = generate_voice(
            'Hello, welcome to SmartCamp.AI Voice Generator!',
            '550e8400-e29b-41d4-a716-446655440001'
        )
        print('Success:', result)
    except Exception as e:
        print('Error:', e)
```

---

### cURL

```bash
# Create generation
curl -X POST https://voice.smartcamp.ai/api/generate \
  -H "Authorization: Bearer vg_live_1234567890abcdef1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, welcome to SmartCamp.AI Voice Generator!",
    "voice_id": "550e8400-e29b-41d4-a716-446655440001",
    "settings": {
      "speed": 1.0,
      "format": "mp3",
      "quality": "high"
    }
  }'

# Check status
curl -X GET https://voice.smartcamp.ai/api/generate/550e8400-e29b-41d4-a716-446655440003 \
  -H "Authorization: Bearer vg_live_1234567890abcdef1234567890abcdef"

# Download audio
curl -X GET https://voice.smartcamp.ai/api/generate/550e8400-e29b-41d4-a716-446655440003/download \
  -H "Authorization: Bearer vg_live_1234567890abcdef1234567890abcdef" \
  -o output.mp3

# Get credit balance
curl -X GET https://voice.smartcamp.ai/api/credits/balance \
  -H "Authorization: Bearer vg_live_1234567890abcdef1234567890abcdef"

# List voices
curl -X GET "https://voice.smartcamp.ai/api/voices?language=en&gender=male" \
  -H "Authorization: Bearer vg_live_1234567890abcdef1234567890abcdef"
```

---

## Support

For API support:
- **Documentation**: https://voice.smartcamp.ai/docs
- **Email**: api-support@smartcamp.ai
- **Status Page**: https://status.smartcamp.ai

## Changelog

### v1.0.0 (2025-11-18)
- Initial API release
- Voice generation endpoints
- Project management
- Credit system
- Subscription management
- API key authentication
