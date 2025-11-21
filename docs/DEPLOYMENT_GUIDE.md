# AI Voice Generator - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the AI Voice Generator application to production environments.

## Architecture Overview

### Technology Stack

- **Frontend/Backend**: Next.js 14 (App Router) with TypeScript
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **AI Providers**: OpenAI TTS / ElevenLabs
- **Payments**: Stripe
- **Email**: Resend
- **Workflow Automation**: n8n
- **Container Runtime**: Docker + Docker Compose
- **Reverse Proxy**: Traefik (recommended)

### Application Structure

```
ai-voice-generator/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   ├── lib/                   # Core libraries
│   │   ├── supabase/         # Supabase clients
│   │   ├── ai/               # AI provider integrations
│   │   ├── stripe/           # Stripe integration
│   │   └── email/            # Email service
│   └── types/                 # TypeScript types
├── supabase/                  # Database schema
├── public/                    # Static assets
└── docker-compose.yml         # Container orchestration
```

### Database Schema

The application uses PostgreSQL with the following main tables:

- `voicegen_users` - User profiles (extends auth.users)
- `voicegen_projects` - User projects for organizing generations
- `voicegen_voices` - Available AI voices
- `voicegen_generations` - Voice generation jobs
- `voicegen_custom_voices` - User-created custom voices
- `voicegen_credit_transactions` - Credit purchase/usage history
- `voicegen_subscriptions` - User subscriptions (Stripe)
- `voicegen_api_keys` - API keys for programmatic access

## Prerequisites

### Required Services

1. **Supabase Account** (or self-hosted Supabase)
   - PostgreSQL database
   - Authentication service
   - Storage buckets
   - Get credentials from: https://supabase.com/dashboard

2. **OpenAI API Key** (Required)
   - Sign up at: https://platform.openai.com
   - Get API key from: https://platform.openai.com/api-keys
   - Minimum tier: Pay-as-you-go

3. **Domain Name** (Production)
   - Register a domain (e.g., voice.smartcamp.ai)
   - Configure DNS A records to point to your server IP

### Optional Services

4. **ElevenLabs API Key** (Optional - Premium voices)
   - Sign up at: https://elevenlabs.io
   - Get API key from account settings

5. **Stripe Account** (Required for payments)
   - Sign up at: https://stripe.com
   - Get API keys from: https://dashboard.stripe.com/apikeys
   - Set up products and pricing

6. **Resend Account** (Required for emails)
   - Sign up at: https://resend.com
   - Get API key from: https://resend.com/api-keys
   - Verify your domain

7. **n8n Instance** (Optional - Workflow automation)
   - Self-hosted or cloud: https://n8n.io
   - Configure webhook endpoints

### Server Requirements

**Minimum (Development/Small Scale)**
- 2 CPU cores
- 4GB RAM
- 20GB SSD storage
- Ubuntu 20.04+ or Debian 11+

**Recommended (Production)**
- 4 CPU cores
- 8GB RAM
- 50GB SSD storage
- Ubuntu 22.04 LTS

**Software Requirements**
- Docker 24.0+
- Docker Compose 2.20+
- Node.js 20+ (for local development)
- Git

## Environment Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env.production
```

### 2. Required Environment Variables

#### Application Configuration

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://voice.smartcamp.ai
NEXT_PUBLIC_APP_NAME=AI Voice Generator
```

#### Supabase Configuration

```bash
# Get these from: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase-settings
```

**How to get Supabase credentials:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL → use as `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the `anon` `public` key → use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy the `service_role` `secret` key → use as `SUPABASE_SERVICE_ROLE_KEY`
6. Navigate to Settings → Database → Connection string
7. Copy JWT Secret → use as `SUPABASE_JWT_SECRET`

#### AI Provider Configuration

```bash
# OpenAI (Required)
OPENAI_API_KEY=sk-proj-...
AI_VOICE_PROVIDER=openai

# ElevenLabs (Optional - for premium voices)
# ELEVENLABS_API_KEY=your-elevenlabs-key
```

**How to get OpenAI API key:**
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (you won't be able to see it again!)

#### Stripe Configuration

```bash
# Get these from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs (create products in Stripe Dashboard)
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_ENTERPRISE_MONTHLY=price_...
STRIPE_PRICE_ID_CREDITS_100K=price_...
STRIPE_PRICE_ID_CREDITS_500K=price_...
```

**How to set up Stripe:**
1. Create products in Stripe Dashboard → Products
2. Create prices for each product
3. Copy price IDs and add to environment variables
4. Set up webhook endpoint (see Webhook Configuration section)

#### Email Configuration

```bash
# Resend (Recommended)
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_...
EMAIL_FROM=noreply@smartcamp.ai
EMAIL_FROM_NAME=SmartCamp.AI Voice Generator
```

**How to get Resend API key:**
1. Sign up at https://resend.com
2. Go to API Keys section
3. Create new API key
4. Verify your sending domain in Domains section

### 3. Optional Configuration

#### n8n Integration

```bash
N8N_WEBHOOK_BASE_URL=https://n8n.smartcamp.ai/webhook/
N8N_WEBHOOK_SECRET=your-webhook-secret-key
```

#### Analytics (Placeholder for future integrations)

```bash
# Plausible Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=voice.smartcamp.ai
NEXT_PUBLIC_PLAUSIBLE_API_HOST=https://plausible.io

# Sentry (Will be configured in integration phase)
# NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# PostHog (Will be configured in integration phase)
# NEXT_PUBLIC_POSTHOG_KEY=phc_...
# NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

#### Feature Flags

```bash
ENABLE_VOICE_CLONING=false
ENABLE_API_ACCESS=true
ENABLE_BATCH_PROCESSING=true
ENABLE_TEAM_FEATURES=false
ENABLE_CHATBOT=true
```

#### Rate Limiting

```bash
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_GENERATION_MAX_CONCURRENT=10
RATE_LIMIT_GENERATION_MAX_HOURLY=100
```

## Supabase Setup

### 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization and enter project details
4. Wait for project to be provisioned (~2 minutes)

### 2. Run Database Migrations

The application includes SQL migrations in `supabase/schema.sql`. Run this in Supabase SQL Editor:

```bash
# Method 1: Using Supabase Dashboard
# 1. Go to SQL Editor in Supabase Dashboard
# 2. Click "New Query"
# 3. Copy contents of supabase/schema.sql
# 4. Click "Run"

# Method 2: Using migration script (requires DATABASE_URL)
npm run db:migrate
```

### 3. Seed Voice Library

Populate the voices table with available AI voices:

```bash
# Set environment variables first
export NEXT_PUBLIC_SUPABASE_URL=your-url
export SUPABASE_SERVICE_ROLE_KEY=your-key

# Run seed script
npm run db:seed
```

### 4. Configure Storage Buckets

Create storage buckets for audio files:

1. Go to Storage in Supabase Dashboard
2. Create a new bucket named `voice-generations`
3. Set it to **Public** (or configure RLS policies)
4. Create another bucket named `voice-samples` for custom voice uploads

### 5. Enable Row Level Security (RLS)

The schema includes RLS policies. Verify they are enabled:

1. Go to Authentication → Policies
2. Check that policies are enabled for all tables
3. Main policies:
   - Users can only access their own data
   - Voices table is readable by all authenticated users
   - Generations are isolated by user_id

### 6. Configure Authentication

1. Go to Authentication → Providers
2. Enable Email provider (enabled by default)
3. Optional: Enable OAuth providers (Google, GitHub, etc.)
4. Configure email templates in Authentication → Email Templates
5. Set Site URL to your production domain

## Deployment Options

### Option 1: Docker Compose (Recommended)

This is the simplest deployment method suitable for single-server deployments.

#### Step 1: Clone Repository

```bash
git clone https://github.com/your-org/ai-voice-generator.git
cd ai-voice-generator
```

#### Step 2: Configure Environment

```bash
cp .env.example .env.production
nano .env.production  # Edit with your values
```

#### Step 3: Build and Run

```bash
# Build the image
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Check status
docker-compose ps
```

#### Step 4: Verify Deployment

```bash
# Check if app is running
curl http://localhost:3000/api/health

# Expected response:
# {"status":"ok","timestamp":"2025-11-21T..."}
```

### Option 2: Direct Node.js Deployment

For deployments without Docker.

#### Step 1: Install Dependencies

```bash
git clone https://github.com/your-org/ai-voice-generator.git
cd ai-voice-generator
npm install
```

#### Step 2: Build Application

```bash
# Create production build
npm run build
```

#### Step 3: Run Production Server

```bash
# Using npm
npm start

# Or using PM2 (recommended for production)
npm install -g pm2
pm2 start npm --name "voice-generator" -- start
pm2 save
pm2 startup  # Configure auto-start on reboot
```

### Option 3: Vercel Deployment

Deploy to Vercel for automatic scaling and CDN.

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy

```bash
vercel login
vercel --prod
```

#### Step 3: Configure Environment Variables

Add all environment variables in Vercel Dashboard → Project Settings → Environment Variables

**Note**: Vercel deployment is serverless. Consider:
- Cold start times for API routes
- Serverless function execution limits (10s default, 60s max on Pro)
- Voice generation may need longer timeouts

### Option 4: Cloud Platforms

#### AWS (Elastic Beanstalk / ECS)

1. Create Elastic Beanstalk application
2. Use Docker platform
3. Configure environment variables
4. Deploy using EB CLI or AWS Console

#### Google Cloud (Cloud Run)

```bash
gcloud run deploy voice-generator \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Azure (App Service)

1. Create App Service
2. Configure for Node.js 20
3. Deploy via GitHub Actions or Azure CLI

## Reverse Proxy Configuration (Traefik)

For production deployments, use Traefik for SSL/TLS termination and routing.

### docker-compose.yml with Traefik

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=false"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@smartcamp.ai"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./letsencrypt:/letsencrypt"
    networks:
      - web

  app:
    build: .
    env_file:
      - .env.production
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(`voice.smartcamp.ai`)"
      - "traefik.http.routers.app.entrypoints=websecure"
      - "traefik.http.routers.app.tls.certresolver=letsencrypt"
      - "traefik.http.services.app.loadbalancer.server.port=3000"
    networks:
      - web

networks:
  web:
    external: true
```

## Monitoring and Logging

### Health Check Endpoint

The application exposes a health check endpoint:

```bash
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-21T10:30:00Z",
  "version": "1.0.0"
}
```

### Docker Logs

```bash
# View logs
docker-compose logs -f app

# View last 100 lines
docker-compose logs --tail=100 app
```

### PM2 Monitoring

```bash
# View logs
pm2 logs voice-generator

# Monitor metrics
pm2 monit

# View status
pm2 status
```

## Backup and Recovery

### Database Backups

Supabase provides automatic daily backups. To create manual backups:

```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Or via pg_dump if you have direct access
pg_dump $DATABASE_URL > backup.sql
```

### Storage Backups

Backup Supabase Storage buckets:

1. Use Supabase Dashboard → Storage → Download all files
2. Or use AWS S3 sync if using custom storage backend

## Security Checklist

- [ ] All environment variables configured securely
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Supabase RLS policies enabled
- [ ] API rate limiting configured
- [ ] Stripe webhook signatures verified
- [ ] CORS configured properly
- [ ] Security headers enabled (see next.config.js)
- [ ] Service role key never exposed to client
- [ ] Database backups scheduled
- [ ] Monitoring and alerting set up

## Troubleshooting

### Application Won't Start

1. Check environment variables are set correctly
2. Verify Supabase credentials are valid
3. Check Docker logs: `docker-compose logs app`
4. Ensure port 3000 is not already in use

### Database Connection Errors

1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check Supabase project is not paused
3. Verify network connectivity to Supabase
4. Check RLS policies are not blocking queries

### Voice Generation Fails

1. Verify OpenAI API key is valid and has credits
2. Check rate limits are not exceeded
3. Verify user has sufficient credits
4. Check Storage bucket permissions

### Stripe Webhooks Not Working

1. Verify webhook endpoint is accessible
2. Check `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
3. Test webhook with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Verify webhook signature validation is passing

## Production Deployment Checklist

- [ ] Domain DNS configured
- [ ] SSL certificate obtained and configured
- [ ] Environment variables set in production
- [ ] Supabase project created and configured
- [ ] Database migrations run
- [ ] Voice library seeded
- [ ] Storage buckets created and configured
- [ ] Stripe products and prices created
- [ ] Stripe webhooks configured
- [ ] Email domain verified with Resend
- [ ] Test email sending works
- [ ] Test voice generation works
- [ ] Test payment flow works
- [ ] Rate limiting configured
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Security headers verified
- [ ] CORS configured
- [ ] Error tracking configured (once Sentry integrated)

## Scaling Considerations

### Horizontal Scaling

For high traffic, consider:

1. **Load Balancer**: Use AWS ELB, Google Cloud Load Balancer, or Nginx
2. **Multiple Instances**: Run multiple app containers behind load balancer
3. **CDN**: Use Cloudflare or AWS CloudFront for static assets
4. **Caching**: Implement Redis caching (see INTEGRATION_PLAN.md)

### Database Optimization

1. Enable connection pooling in Supabase
2. Add indexes for frequently queried columns
3. Consider read replicas for analytics queries
4. Monitor slow queries and optimize

### Storage Optimization

1. Configure CDN for Supabase Storage
2. Implement audio file compression
3. Set up lifecycle policies for old files
4. Consider AWS S3 or Cloudflare R2 for high volume

## Support

For deployment assistance:
- Email: support@smartcamp.ai
- Documentation: https://docs.smartcamp.ai/voice
- GitHub Issues: https://github.com/SmartCampAI/ai-voice-generator/issues

## Next Steps

After successful deployment:

1. Review [INTEGRATION_PLAN.md](./INTEGRATION_PLAN.md) for adding Redis, PostHog, Sentry, Loops
2. Check [ROADMAP.md](./ROADMAP.md) for future feature development
3. Set up monitoring and alerting
4. Configure automated backups
5. Plan for scaling based on usage

---

**Last Updated**: 2025-11-21
**Version**: 1.0.0
