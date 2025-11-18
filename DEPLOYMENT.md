# AI Voice Generator - Deployment Guide

Complete step-by-step guide for deploying the AI Voice Generator to production on SmartCamp.AI VPS infrastructure.

**Target URL**: `https://voice.smartcamp.ai`

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Docker Image Build](#docker-image-build)
4. [Supabase Configuration](#supabase-configuration)
5. [n8n Workflow Setup](#n8n-workflow-setup)
6. [Stripe Integration](#stripe-integration)
7. [Email Configuration](#email-configuration)
8. [DNS & SSL Setup](#dns--ssl-setup)
9. [Application Deployment](#application-deployment)
10. [Health Checks & Verification](#health-checks--verification)
11. [Post-Deployment Tasks](#post-deployment-tasks)
12. [Rollback Procedures](#rollback-procedures)
13. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Infrastructure Requirements

- [ ] VPS running Ubuntu 22.04 LTS (minimum 4GB RAM, 2 CPU cores, 50GB SSD)
- [ ] Docker and Docker Compose installed
- [ ] Traefik reverse proxy configured and running
- [ ] Supabase stack deployed and operational
- [ ] n8n workflow automation running
- [ ] Flowise chatbot deployed (optional)
- [ ] Gotenberg PDF service running
- [ ] Domain `smartcamp.ai` with DNS access

### Service URLs (Must be operational)

- `https://api.supabase.smartcamp.ai` - Supabase API
- `https://n8n.smartcamp.ai` - n8n workflows
- `https://flowise.smartcamp.ai` - Flowise chatbot
- `https://gotenberg.smartcamp.ai` - Gotenberg PDF service

### External Services

- [ ] OpenAI API account (or ElevenLabs)
- [ ] Stripe account (test and live modes)
- [ ] Email provider account (Resend or SendGrid)
- [ ] GitHub repository access

### Local Development Tools

- [ ] Node.js 20.x or higher
- [ ] npm or pnpm
- [ ] Docker Desktop (for local testing)
- [ ] Git
- [ ] SSH access to VPS

---

## Environment Setup

### Step 1: Clone Repository

```bash
# On VPS
ssh user@your-vps-ip

# Create application directory
sudo mkdir -p /opt/voice-generator
sudo chown $USER:$USER /opt/voice-generator
cd /opt/voice-generator

# Clone repository
git clone https://github.com/your-org/ai-voice-generator.git .
```

### Step 2: Environment Variables Checklist

Create `.env.production` file:

```bash
cp .env.example .env.production
nano .env.production
```

#### Complete Environment Variables

```bash
# ==============================================
# APPLICATION CONFIGURATION
# ==============================================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://voice.smartcamp.ai
NEXT_PUBLIC_APP_NAME="AI Voice Generator"

# ==============================================
# SUPABASE CONFIGURATION
# ==============================================
# Get these from Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://api.supabase.smartcamp.ai
NEXT_PUBLIC_SUPABASE_ANON_KEY=***REDACTED_SUPABASE_ANON_KEY***

# Service role key (keep secret!)
SUPABASE_SERVICE_ROLE_KEY=***REDACTED_SUPABASE_SERVICE_KEY***

# JWT secret (same as Supabase)
SUPABASE_JWT_SECRET=your-super-secret-jwt-secret-minimum-32-characters-long

# Database direct connection (optional, for migrations)
DATABASE_URL=postgresql://postgres:your-postgres-password@supabase-db:5432/postgres

# ==============================================
# AI VOICE PROVIDER
# ==============================================
# Option 1: OpenAI
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VOICE_PROVIDER=openai

# Option 2: ElevenLabs (alternative)
# ELEVENLABS_API_KEY=your-elevenlabs-key
# VOICE_PROVIDER=elevenlabs

# ==============================================
# N8N WEBHOOKS
# ==============================================
N8N_WEBHOOK_BASE_URL=https://n8n.smartcamp.ai/webhook/
N8N_WEBHOOK_SECRET=your-webhook-secret-random-string-here

# ==============================================
# GOTENBERG (PDF SERVICE)
# ==============================================
GOTENBERG_API_URL=http://gotenberg:3000

# ==============================================
# FLOWISE (AI CHATBOT)
# ==============================================
FLOWISE_API_URL=https://flowise.smartcamp.ai
FLOWISE_CHATFLOW_ID=your-chatflow-id-from-flowise

# ==============================================
# STRIPE PAYMENTS
# ==============================================
# Get from Stripe Dashboard → Developers → API keys
STRIPE_SECRET_KEY=sk_live_REPLACE_WITH_YOUR_ACTUAL_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_REPLACE_WITH_YOUR_ACTUAL_PUBLISHABLE_KEY

# Webhook secret (from Stripe webhook configuration)
STRIPE_WEBHOOK_SECRET=whsec_REPLACE_WITH_YOUR_ACTUAL_WEBHOOK_SECRET

# Price IDs (create products first in Stripe)
STRIPE_PRICE_PRO_MONTHLY=price_XXXXXXXXXXXXXXXXXX
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_XXXXXXXXXXXXXXXXXX
STRIPE_PRICE_CREDITS_100K=price_XXXXXXXXXXXXXXXXXX
STRIPE_PRICE_CREDITS_500K=price_XXXXXXXXXXXXXXXXXX

# ==============================================
# EMAIL PROVIDER
# ==============================================
# Option 1: Resend
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EMAIL_FROM=noreply@smartcamp.ai
EMAIL_FROM_NAME=SmartCamp.AI Voice Generator

# Option 2: SendGrid (alternative)
# EMAIL_PROVIDER=sendgrid
# EMAIL_API_KEY=SG.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# ==============================================
# ANALYTICS (OPTIONAL)
# ==============================================
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=voice.smartcamp.ai
NEXT_PUBLIC_PLAUSIBLE_API_HOST=https://plausible.io

# ==============================================
# ERROR TRACKING (OPTIONAL)
# ==============================================
# NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
# SENTRY_AUTH_TOKEN=your-sentry-auth-token

# ==============================================
# FEATURE FLAGS
# ==============================================
ENABLE_VOICE_CLONING=false
ENABLE_API_ACCESS=true
ENABLE_BATCH_PROCESSING=true
ENABLE_CHATBOT=true

# ==============================================
# RATE LIMITING
# ==============================================
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_API_KEY_MAX_REQUESTS=1000

# ==============================================
# SECURITY
# ==============================================
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-nextauth-secret-random-string-minimum-32-chars
ENCRYPTION_KEY=your-encryption-key-for-sensitive-data-32-chars

# ==============================================
# LOGGING
# ==============================================
LOG_LEVEL=info
LOG_FORMAT=json
```

### Step 3: Secure Environment File

```bash
# Set proper permissions
chmod 600 .env.production

# Verify no secrets in git
git update-index --assume-unchanged .env.production
```

---

## Docker Image Build

### Step 1: Review Dockerfile

Ensure `/opt/voice-generator/Dockerfile` exists:

```dockerfile
# Multi-stage build for production
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED 1

# Build Next.js application
RUN npm run build

# Production image, copy all files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Step 2: Update next.config.js

Ensure standalone output is enabled:

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['api.supabase.smartcamp.ai'],
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}

module.exports = nextConfig
```

### Step 3: Build Docker Image

```bash
cd /opt/voice-generator

# Build with BuildKit for better caching
DOCKER_BUILDKIT=1 docker build -t voice-generator:latest .

# Verify image
docker images | grep voice-generator

# Expected output:
# voice-generator   latest   abc123def456   2 minutes ago   500MB
```

### Step 4: Test Image Locally

```bash
# Run container locally to test
docker run --rm \
  -p 3000:3000 \
  --env-file .env.production \
  voice-generator:latest

# In another terminal, test
curl http://localhost:3000/api/health

# Expected: {"status":"ok"}

# Stop test container (Ctrl+C)
```

---

## Supabase Configuration

### Step 1: Database Schema Deployment

```bash
# Connect to Supabase database
docker exec -it supabase-db psql -U postgres

# Or via remote connection
psql postgresql://postgres:your-password@api.supabase.smartcamp.ai:5432/postgres
```

### Step 2: Create Database Schema

```bash
# Run schema file
docker exec -i supabase-db psql -U postgres < /opt/voice-generator/supabase/schema.sql
```

**Key schema components** (auto-created by schema.sql):

- **Tables**: `voicegen_users`, `voicegen_projects`, `voicegen_generations`, `voicegen_voices`, `voicegen_custom_voices`, `voicegen_credits`, `voicegen_subscriptions`, `voicegen_api_keys`, `voicegen_webhooks`
- **RLS Policies**: Enabled on all tables
- **Functions**: Helper functions for credit management
- **Triggers**: Automatic timestamp updates

### Step 3: Verify Tables

```sql
-- List all voicegen tables
SELECT tablename FROM pg_tables WHERE tablename LIKE 'voicegen_%';

-- Should return 9 tables

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename LIKE 'voicegen_%';

-- All should show: rowsecurity = t (true)
```

### Step 4: Create Storage Buckets

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('voicegen-audio', 'voicegen-audio', false, 52428800, ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg']),
  ('voicegen-voice-samples', 'voicegen-voice-samples', false, 52428800, ARRAY['audio/wav', 'audio/mpeg']),
  ('voicegen-invoices', 'voicegen-invoices', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;
```

### Step 5: Configure Storage Policies

```sql
-- Policy: Users can upload to their own folder in voicegen-audio
CREATE POLICY "Users can upload own audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'voicegen-audio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own audio
CREATE POLICY "Users can read own audio"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'voicegen-audio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own audio
CREATE POLICY "Users can delete own audio"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'voicegen-audio'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Repeat similar policies for voicegen-voice-samples and voicegen-invoices
```

### Step 6: Seed Voice Profiles

```bash
# Run voice seeding script
docker exec -i supabase-db psql -U postgres < /opt/voice-generator/supabase/seed-voices.sql

# Or from app container (once deployed)
docker exec voice-generator npm run seed:voices
```

### Step 7: Verify Database Setup

```sql
-- Check voice profiles
SELECT COUNT(*) FROM voicegen_voices WHERE is_active = true;
-- Expected: 50+ voices

-- Check storage buckets
SELECT id, name, public FROM storage.buckets WHERE id LIKE 'voicegen%';
-- Expected: 3 buckets

-- Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename LIKE 'voicegen_%';
-- Expected: Multiple policies per table
```

---

## n8n Workflow Setup

### Step 1: Access n8n

```bash
# Open n8n in browser
open https://n8n.smartcamp.ai
```

### Step 2: Import Workflows

Import the following workflows from `/opt/voice-generator/n8n/workflows/`:

1. **user-onboarding.json**
2. **generation-complete.json**
3. **subscription-management.json**
4. **invoice-generation.json**
5. **usage-alerts.json**

```bash
# For each workflow:
# 1. Click "Import from File"
# 2. Select workflow JSON file
# 3. Configure credentials
# 4. Activate workflow
```

### Step 3: Configure Webhook Credentials

For each webhook node:

1. Click on webhook node
2. Set **Webhook URL**: `https://n8n.smartcamp.ai/webhook/{workflow-name}`
3. Set **Authentication**: Header Auth
4. Add header: `X-Webhook-Secret` = `your-webhook-secret` (from .env.production)

### Step 4: Configure Supabase Credentials

1. Click "Credentials" → "New"
2. Select "Supabase"
3. Enter:
   - **Host**: `api.supabase.smartcamp.ai`
   - **Service Role Key**: (from .env.production)

### Step 5: Configure Email Credentials

1. Click "Credentials" → "New"
2. Select "Resend" or "SendGrid"
3. Enter API key from .env.production

### Step 6: Test Workflows

```bash
# Test user onboarding webhook
curl -X POST https://n8n.smartcamp.ai/webhook/user-onboarding \
  -H "X-Webhook-Secret: your-webhook-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "user.created",
    "data": {
      "user_id": "test-user-id",
      "email": "test@example.com"
    }
  }'

# Expected: 200 OK
```

### Step 7: Activate All Workflows

Ensure all 5 workflows are **Active** (toggle switch is green).

---

## Stripe Integration

### Step 1: Create Stripe Account

1. Sign up at https://stripe.com
2. Complete business verification
3. Enable both Test and Live modes

### Step 2: Create Products

In Stripe Dashboard → Products:

#### Pro Plan

- **Name**: Pro Plan
- **Description**: 500,000 credits per month
- **Price**: $19.00 / month recurring
- **Copy Price ID**: `price_XXX` → Add to .env.production as `STRIPE_PRICE_PRO_MONTHLY`

#### Enterprise Plan

- **Name**: Enterprise Plan
- **Description**: Unlimited credits
- **Price**: $99.00 / month recurring
- **Copy Price ID**: `price_XXX` → Add to .env.production as `STRIPE_PRICE_ENTERPRISE_MONTHLY`

#### Credit Packs

- **100k Credits**: $5.00 one-time → `STRIPE_PRICE_CREDITS_100K`
- **500k Credits**: $20.00 one-time → `STRIPE_PRICE_CREDITS_500K`

### Step 3: Configure Webhook

1. Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://voice.smartcamp.ai/api/webhooks/stripe`
4. **Events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `checkout.session.completed`
5. Click "Add endpoint"
6. Copy **Signing secret**: `whsec_XXX` → Add to .env.production as `STRIPE_WEBHOOK_SECRET`

### Step 4: Test Webhook

```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local/test endpoint
stripe listen --forward-to https://voice.smartcamp.ai/api/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed

# Expected: Webhook received successfully
```

### Step 5: Enable Live Mode

Once testing is complete:

1. Switch to Live mode in Stripe Dashboard
2. Copy Live API keys to .env.production
3. Update webhook endpoint to production URL

---

## Email Configuration

### Option 1: Resend (Recommended)

#### Step 1: Create Resend Account

1. Sign up at https://resend.com
2. Verify your email

#### Step 2: Add Domain

1. Resend Dashboard → Domains → Add Domain
2. Enter: `smartcamp.ai`
3. Add DNS records:

```dns
# SPF Record
Type: TXT
Name: smartcamp.ai
Value: v=spf1 include:resend.com ~all

# DKIM Record (provided by Resend)
Type: TXT
Name: resend._domainkey
Value: [Resend provides this]
```

#### Step 3: Get API Key

1. Resend Dashboard → API Keys → Create API Key
2. Copy key: `re_XXX`
3. Add to .env.production as `EMAIL_API_KEY`

#### Step 4: Test Email

```bash
# From VPS
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer re_XXX" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@smartcamp.ai",
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<p>This is a test email</p>"
  }'

# Expected: 200 OK with email ID
```

### Option 2: SendGrid (Alternative)

1. Sign up at https://sendgrid.com
2. Verify sender identity
3. Get API key
4. Update .env.production with SendGrid credentials

---

## DNS & SSL Setup

### Step 1: Add DNS Record

In your DNS provider (e.g., Cloudflare, Namecheap):

```dns
Type: A
Name: voice
Value: [Your VPS IP Address]
TTL: Auto or 300
```

### Step 2: Verify DNS Propagation

```bash
# Check DNS resolution
nslookup voice.smartcamp.ai

# Or
dig voice.smartcamp.ai

# Expected: Returns your VPS IP
```

### Step 3: SSL Certificate (Automatic via Traefik)

Traefik automatically requests Let's Encrypt certificates. Verify Traefik labels in docker-compose.yml:

```yaml
labels:
  - "traefik.http.routers.voice.tls.certresolver=letsencrypt"
```

### Step 4: Verify SSL

```bash
# Check SSL certificate
echo | openssl s_client -servername voice.smartcamp.ai -connect voice.smartcamp.ai:443 2>/dev/null | openssl x509 -noout -dates

# Expected: Valid dates shown

# Test HTTPS
curl -I https://voice.smartcamp.ai

# Expected: 200 OK or 404 (service not deployed yet)
```

---

## Application Deployment

### Step 1: Create Docker Compose File

Create `/opt/voice-generator/docker-compose.yml`:

```yaml
version: '3.8'

networks:
  web:
    external: true

services:
  voice-generator:
    image: voice-generator:latest
    container_name: voice-generator
    restart: unless-stopped
    networks:
      - web
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    labels:
      # Traefik configuration
      - "traefik.enable=true"
      - "traefik.docker.network=web"

      # HTTP router (redirects to HTTPS)
      - "traefik.http.routers.voice-http.rule=Host(`voice.smartcamp.ai`)"
      - "traefik.http.routers.voice-http.entrypoints=web"
      - "traefik.http.routers.voice-http.middlewares=https-redirect"

      # HTTPS router
      - "traefik.http.routers.voice.rule=Host(`voice.smartcamp.ai`)"
      - "traefik.http.routers.voice.entrypoints=websecure"
      - "traefik.http.routers.voice.tls=true"
      - "traefik.http.routers.voice.tls.certresolver=letsencrypt"

      # Service
      - "traefik.http.services.voice.loadbalancer.server.port=3000"

      # Security headers middleware
      - "traefik.http.middlewares.voice-headers.headers.sslRedirect=true"
      - "traefik.http.middlewares.voice-headers.headers.stsSeconds=31536000"
      - "traefik.http.middlewares.voice-headers.headers.stsIncludeSubdomains=true"
      - "traefik.http.middlewares.voice-headers.headers.stsPreload=true"
      - "traefik.http.middlewares.voice-headers.headers.contentTypeNosniff=true"
      - "traefik.http.middlewares.voice-headers.headers.browserXssFilter=true"
      - "traefik.http.middlewares.voice-headers.headers.frameDeny=true"
      - "traefik.http.routers.voice.middlewares=voice-headers"

      # HTTPS redirect middleware
      - "traefik.http.middlewares.https-redirect.redirectscheme.scheme=https"
      - "traefik.http.middlewares.https-redirect.redirectscheme.permanent=true"

    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Step 2: Deploy Application

```bash
cd /opt/voice-generator

# Verify configuration
docker-compose config

# Start the application
docker-compose up -d

# Watch logs
docker-compose logs -f

# Expected: Application starts successfully
```

### Step 3: Verify Container Status

```bash
# Check running containers
docker ps | grep voice-generator

# Expected output:
# voice-generator   voice-generator:latest   "node server.js"   Up 2 minutes   3000/tcp

# Check container health
docker inspect voice-generator | grep -A 5 Health

# Expected: "Status": "healthy"
```

---

## Health Checks & Verification

### Step 1: Application Health Check

```bash
# Test health endpoint
curl https://voice.smartcamp.ai/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-11-18T10:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "ok",
    "storage": "ok",
    "ai_provider": "ok"
  }
}
```

### Step 2: Database Connectivity

```bash
# Test database connection
docker exec voice-generator node -e "
  const { createClient } = require('@supabase/supabase-js');
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  client.from('voicegen_voices').select('count').then(console.log);
"

# Expected: { count: 50+ }
```

### Step 3: Storage Access

```bash
# Test storage access
curl https://api.supabase.smartcamp.ai/storage/v1/bucket/voicegen-audio \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}"

# Expected: Bucket information returned
```

### Step 4: AI Provider Connection

```bash
# Test OpenAI connection
docker exec voice-generator node -e "
  const OpenAI = require('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  openai.models.list().then(() => console.log('OpenAI: Connected'));
"

# Expected: "OpenAI: Connected"
```

### Step 5: Full Integration Test

```bash
# Test complete user flow
curl -X POST https://voice.smartcamp.ai/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "full_name": "Test User"
  }'

# Expected: User created with access token
```

---

## Post-Deployment Tasks

### Step 1: Create Admin User

```sql
-- Connect to database
psql postgresql://postgres:password@api.supabase.smartcamp.ai:5432/postgres

-- Create admin user (after signing up normally)
UPDATE voicegen_users
SET role = 'admin', credits_balance = 999999999
WHERE email = 'admin@smartcamp.ai';
```

### Step 2: Configure Monitoring

#### UptimeRobot Setup

1. Go to https://uptimerobot.com
2. Create new monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://voice.smartcamp.ai/api/health`
   - **Interval**: 5 minutes
   - **Alert Contacts**: Your email

#### Error Tracking (Optional)

If using Sentry:

```bash
# Add Sentry DSN to .env.production
# Restart application
docker-compose restart voice-generator
```

### Step 3: Configure Backups

Create backup script `/opt/voice-generator/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backups/voice-generator"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup voicegen database tables
docker exec supabase-db pg_dump -U postgres -d postgres \
  -t 'voicegen_*' | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup environment file (encrypted)
tar czf $BACKUP_DIR/env_$DATE.tar.gz .env.production
gpg --symmetric --cipher-algo AES256 $BACKUP_DIR/env_$DATE.tar.gz
rm $BACKUP_DIR/env_$DATE.tar.gz

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "env_*.tar.gz.gpg" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Schedule backup:

```bash
chmod +x /opt/voice-generator/backup.sh

# Add to crontab
crontab -e

# Add line (daily at 2 AM)
0 2 * * * /opt/voice-generator/backup.sh >> /var/log/voice-backup.log 2>&1
```

### Step 4: Security Hardening

```bash
# Enable firewall
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw status

# Install fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Secure SSH (disable password auth, use keys only)
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

### Step 5: Performance Optimization

```bash
# Enable Redis caching (optional)
# Add to docker-compose.yml:
# redis:
#   image: redis:7-alpine
#   container_name: voice-redis
#   restart: unless-stopped

# Update .env.production:
# REDIS_URL=redis://redis:6379
```

---

## Rollback Procedures

### Quick Rollback (Same Image)

```bash
cd /opt/voice-generator

# Stop application
docker-compose down

# Restart with previous configuration
docker-compose up -d

# Verify
curl https://voice.smartcamp.ai/api/health
```

### Full Rollback (Previous Image)

```bash
# Tag current image as backup
docker tag voice-generator:latest voice-generator:backup

# Restore previous image
docker tag voice-generator:previous voice-generator:latest

# Restart
docker-compose up -d

# Verify
docker-compose logs -f
```

### Database Rollback

```bash
# List available backups
ls -lh /backups/voice-generator/db_*.sql.gz

# Restore from backup
gunzip -c /backups/voice-generator/db_20251118_020000.sql.gz | \
  docker exec -i supabase-db psql -U postgres

# Verify restoration
docker exec supabase-db psql -U postgres -c "SELECT COUNT(*) FROM voicegen_users;"
```

### Emergency Shutdown

```bash
# Stop all voice generator services
docker-compose down

# Check status
docker ps | grep voice

# Display maintenance page (via Traefik)
# Create maintenance docker container
```

---

## Troubleshooting

### Issue: Application won't start

**Symptoms**: Container exits immediately

**Solution**:
```bash
# Check logs
docker-compose logs voice-generator

# Common causes:
# 1. Missing environment variables
docker exec voice-generator env | grep -E 'SUPABASE|OPENAI|STRIPE'

# 2. Port already in use
sudo netstat -tlnp | grep 3000

# 3. Invalid configuration
docker-compose config --quiet && echo "Config OK" || echo "Config Error"
```

---

### Issue: Database connection failed

**Symptoms**: "Unable to connect to database" errors

**Solution**:
```bash
# Test Supabase connectivity
docker exec voice-generator wget -O- https://api.supabase.smartcamp.ai

# Verify database is running
docker ps | grep supabase-db

# Check network connectivity
docker network inspect web | grep voice-generator

# Test direct connection
docker exec voice-generator psql $DATABASE_URL -c "SELECT 1;"
```

---

### Issue: SSL certificate not working

**Symptoms**: HTTPS not available, browser shows "Not Secure"

**Solution**:
```bash
# Check Traefik logs
docker logs traefik | grep voice.smartcamp.ai

# Verify DNS propagation
nslookup voice.smartcamp.ai

# Check Let's Encrypt rate limits
# https://letsencrypt.org/docs/rate-limits/

# Force certificate renewal
docker exec traefik traefik healthcheck

# Restart Traefik
docker restart traefik
```

---

### Issue: Voice generation fails

**Symptoms**: Generations stuck in "processing" or fail immediately

**Solution**:
```bash
# Check AI provider API key
docker exec voice-generator env | grep OPENAI_API_KEY

# Test OpenAI directly
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check generation logs
docker exec voice-generator tail -f /app/.next/server/logs/generations.log

# Verify credits are available
docker exec voice-generator psql $DATABASE_URL \
  -c "SELECT credits_balance FROM voicegen_users WHERE email='test@example.com';"
```

---

### Issue: Webhook not firing

**Symptoms**: n8n workflows not triggered

**Solution**:
```bash
# Test webhook manually
curl -X POST https://n8n.smartcamp.ai/webhook/generation-complete \
  -H "X-Webhook-Secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{"event":"test"}'

# Check n8n logs
docker logs n8n | grep webhook

# Verify webhook secret matches
docker exec voice-generator env | grep N8N_WEBHOOK_SECRET
```

---

### Issue: High memory usage

**Symptoms**: Container using >90% memory, slow performance

**Solution**:
```bash
# Check resource usage
docker stats voice-generator

# Increase container memory limit
# Add to docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 2G

# Restart with new limits
docker-compose up -d

# Check for memory leaks in logs
docker logs voice-generator | grep -i "out of memory"
```

---

### Issue: Stripe webhook failing

**Symptoms**: Subscriptions not updating, payments not processing

**Solution**:
```bash
# Check webhook endpoint
curl -I https://voice.smartcamp.ai/api/webhooks/stripe

# Verify webhook secret
docker exec voice-generator env | grep STRIPE_WEBHOOK_SECRET

# Test webhook with Stripe CLI
stripe listen --forward-to https://voice.smartcamp.ai/api/webhooks/stripe
stripe trigger checkout.session.completed

# Check Stripe Dashboard → Developers → Webhooks → [Your webhook] → Recent deliveries
```

---

## Deployment Checklist

Use this checklist before marking deployment as complete:

### Pre-Deployment
- [ ] VPS meets minimum requirements (4GB RAM, 2 CPU, 50GB disk)
- [ ] All prerequisite services running (Traefik, Supabase, n8n)
- [ ] Environment variables configured
- [ ] DNS record created and propagated
- [ ] External service accounts created (OpenAI, Stripe, Email)

### Build & Deploy
- [ ] Docker image built successfully
- [ ] Image tested locally
- [ ] docker-compose.yml configured
- [ ] Application deployed and running
- [ ] Container marked as healthy

### Database
- [ ] Schema deployed
- [ ] RLS policies enabled
- [ ] Storage buckets created
- [ ] Voice profiles seeded
- [ ] Test queries successful

### Integrations
- [ ] n8n workflows imported and active
- [ ] Stripe products created
- [ ] Stripe webhook configured
- [ ] Email provider verified
- [ ] Test emails sent successfully

### Security
- [ ] SSL certificate active
- [ ] HTTPS redirect working
- [ ] Firewall configured
- [ ] fail2ban installed
- [ ] Backup script scheduled

### Testing
- [ ] Health endpoint responds
- [ ] User can sign up
- [ ] User can log in
- [ ] Voice generation works
- [ ] Audio download works
- [ ] Credits deducted correctly
- [ ] Subscription upgrade works

### Monitoring
- [ ] Uptime monitor configured
- [ ] Error tracking enabled (if using)
- [ ] Log rotation configured
- [ ] Backup script tested

### Documentation
- [ ] Admin credentials documented
- [ ] Rollback procedure tested
- [ ] Troubleshooting guide reviewed

---

## Support Contacts

**Technical Support**:
- Email: admin@smartcamp.ai
- VPS Provider: [Your provider support]
- Supabase: https://supabase.com/support

**Service Status**:
- https://status.smartcamp.ai (if configured)

**Documentation**:
- API Docs: https://voice.smartcamp.ai/docs
- Branding Guide: /BRANDING_IMPLEMENTATION.md
- Architecture: /docs/ARCHITECTURE.md

---

## Deployment Complete! 🎉

Your AI Voice Generator is now live at:

**https://voice.smartcamp.ai**

Monitor the application for the first 24-48 hours and verify all workflows are functioning correctly.
