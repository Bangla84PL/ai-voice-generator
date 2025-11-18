# VPS Configuration Guide - AI Voice Generator Deployment

## Quick Reference

**Service URLs**:
- Application: `https://voice.smartcamp.ai`
- Supabase API: `https://api.supabase.smartcamp.ai`
- n8n: `https://n8n.smartcamp.ai`
- Flowise: `https://flowise.smartcamp.ai`
- Gotenberg: `https://gotenberg.smartcamp.ai` (internal)

**Project Namespace**: `voicegen_` (for all database objects)

## 1. Prerequisites

- VPS with Ubuntu 22.04 LTS (minimum 4GB RAM, 2 CPU cores, 50GB SSD)
- Domain `smartcamp.ai` with DNS access
- Docker and Docker Compose installed
- Traefik already configured
- Supabase stack already running

## 2. DNS Configuration

Add the following DNS A record:
```
voice.smartcamp.ai  →  [VPS IP Address]
```

Wait for DNS propagation (usually 5-15 minutes).

## 3. Application Setup

### 3.1 Clone and Build

```bash
# Clone the repository
git clone <repository-url> /opt/voice-generator
cd /opt/voice-generator

# Create production environment file
cp .env.example .env.production

# Edit environment variables
nano .env.production
```

### 3.2 Configure Environment Variables

Edit `.env.production`:

```bash
# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://voice.smartcamp.ai
NEXT_PUBLIC_APP_NAME="AI Voice Generator"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://api.supabase.smartcamp.ai
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-minimum-32-characters

# Database (if direct access needed)
DATABASE_URL=postgresql://postgres:your-password@supabase-db:5432/postgres

# AI Voice Provider (Choose one)
OPENAI_API_KEY=sk-...
# OR
ELEVENLABS_API_KEY=...

# n8n Webhooks
N8N_WEBHOOK_BASE_URL=https://n8n.smartcamp.ai/webhook/
N8N_WEBHOOK_SECRET=your-webhook-secret

# Gotenberg (PDF Service)
GOTENBERG_API_URL=http://gotenberg:3000

# Flowise (AI Chatbot)
FLOWISE_API_URL=https://flowise.smartcamp.ai
FLOWISE_CHATFLOW_ID=your-chatflow-id

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Provider (SendGrid or Resend)
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_...
EMAIL_FROM=noreply@smartcamp.ai
EMAIL_FROM_NAME=SmartCamp.AI Voice Generator

# Analytics (Optional)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=voice.smartcamp.ai

# Feature Flags
ENABLE_VOICE_CLONING=false
ENABLE_API_ACCESS=true
ENABLE_BATCH_PROCESSING=true

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3.3 Build Docker Image

```bash
# Build the production image
docker build -t voice-generator:latest .

# Or build with BuildKit for better caching
DOCKER_BUILDKIT=1 docker build -t voice-generator:latest .
```

### 3.4 Create Docker Compose File

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
      - "traefik.enable=true"
      - "traefik.http.routers.voice.rule=Host(`voice.smartcamp.ai`)"
      - "traefik.http.routers.voice.entrypoints=websecure"
      - "traefik.http.routers.voice.tls=true"
      - "traefik.http.routers.voice.tls.certresolver=letsencrypt"
      - "traefik.http.services.voice.loadbalancer.server.port=3000"
      - "traefik.docker.network=web"
      # Security headers
      - "traefik.http.middlewares.voice-headers.headers.sslRedirect=true"
      - "traefik.http.middlewares.voice-headers.headers.stsSeconds=31536000"
      - "traefik.http.middlewares.voice-headers.headers.stsIncludeSubdomains=true"
      - "traefik.http.middlewares.voice-headers.headers.stsPreload=true"
      - "traefik.http.routers.voice.middlewares=voice-headers"
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 3.5 Deploy

```bash
cd /opt/voice-generator

# Start the service
docker-compose up -d

# Check logs
docker-compose logs -f

# Verify service is running
docker ps | grep voice-generator

# Check Traefik routing
curl -I https://voice.smartcamp.ai
```

## 4. Supabase Database Setup

### 4.1 Connect to Supabase

Access Supabase Studio or use psql:

```bash
# Via Docker
docker exec -it supabase-db psql -U postgres

# Or remotely (if enabled)
psql postgresql://postgres:your-password@api.supabase.smartcamp.ai:5432/postgres
```

### 4.2 Run Database Migrations

Execute the SQL schema file:

```bash
# From host
docker exec -i supabase-db psql -U postgres < /opt/voice-generator/supabase/schema.sql

# Or copy SQL and run in Supabase Studio SQL Editor
```

### 4.3 Verify Tables Created

```sql
-- List all voicegen tables
SELECT tablename FROM pg_tables WHERE tablename LIKE 'voicegen_%';

-- Should show:
-- voicegen_users
-- voicegen_projects
-- voicegen_generations
-- voicegen_voices
-- voicegen_custom_voices
-- voicegen_credits
-- voicegen_subscriptions
-- voicegen_api_keys
-- voicegen_webhooks
```

### 4.4 Create Storage Buckets

Run in Supabase Studio or via SQL:

```sql
-- Create buckets (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('voicegen-audio', 'voicegen-audio', false),
  ('voicegen-voice-samples', 'voicegen-voice-samples', false),
  ('voicegen-invoices', 'voicegen-invoices', false);

-- Set bucket policies (authenticated users can CRUD their own files)
-- See supabase/storage-policies.sql for complete RLS policies
```

### 4.5 Verify RLS Policies

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename LIKE 'voicegen_%';

-- All should show: rowsecurity = true
```

## 5. n8n Workflow Setup

### 5.1 Import Workflows

1. Access n8n at `https://n8n.smartcamp.ai`
2. Import workflow files from `/opt/voice-generator/n8n/workflows/`
3. Configure credentials for each workflow

### 5.2 Key Workflows to Set Up

**1. User Onboarding** (`user-onboarding.json`):
- Webhook: `https://n8n.smartcamp.ai/webhook/user-onboarding`
- Trigger: New user signup from Supabase
- Actions: Send welcome email, assign free credits

**2. Voice Generation Complete** (`generation-complete.json`):
- Webhook: `https://n8n.smartcamp.ai/webhook/generation-complete`
- Trigger: Voice generation finished
- Actions: Update credits, notify user

**3. Subscription Management** (`subscription-management.json`):
- Webhook: `https://n8n.smartcamp.ai/webhook/stripe-subscription`
- Trigger: Stripe subscription events
- Actions: Update subscription status, adjust credits

**4. Invoice Generation** (`invoice-generation.json`):
- Schedule: Monthly on 1st day
- Actions: Calculate usage, generate PDF via Gotenberg, email invoice

**5. Usage Alerts** (`usage-alerts.json`):
- Trigger: Credit threshold reached
- Actions: Send email notification

### 5.3 Configure Webhook Secrets

In n8n, set up webhook authentication:
- Use the same `N8N_WEBHOOK_SECRET` from `.env.production`
- Add as header: `X-Webhook-Secret: your-webhook-secret`

## 6. Flowise Chatbot Setup

### 6.1 Create Chatflow

1. Access Flowise at `https://flowise.smartcamp.ai`
2. Create new chatflow for Voice Generator support
3. Configure:
   - LLM: OpenAI GPT-4 or similar
   - Memory: Conversation Buffer Memory
   - Document Loaders: Voice Generator documentation

### 6.2 Deploy Chatflow

1. Save and deploy chatflow
2. Copy the Chatflow ID
3. Update `.env.production` with `FLOWISE_CHATFLOW_ID`

### 6.3 Test Integration

```bash
# Test chatflow API
curl -X POST https://flowise.smartcamp.ai/api/v1/prediction/your-chatflow-id \
  -H "Content-Type: application/json" \
  -d '{"question": "How do I generate a voice?"}'
```

## 7. Stripe Integration

### 7.1 Create Products and Prices

In Stripe Dashboard:
1. Create products:
   - "Pro Plan" - $19/month
   - "Enterprise Plan" - $99/month
   - "Credit Pack 100k" - $5
   - "Credit Pack 500k" - $20

2. Copy Price IDs to `.env.production`

### 7.2 Set Up Webhooks

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://voice.smartcamp.ai/api/webhooks/stripe`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret to `.env.production`

## 8. Email Configuration

### 8.1 Using Resend

```bash
# Get API key from resend.com
# Add to .env.production
EMAIL_PROVIDER=resend
EMAIL_API_KEY=re_...
EMAIL_FROM=noreply@smartcamp.ai
```

### 8.2 Verify Domain

Add DNS records for email authentication:
```
TXT  smartcamp.ai  v=spf1 include:resend.com ~all
DKIM <provided by Resend>
```

### 8.3 Test Email

```bash
# From app container
docker exec -it voice-generator node scripts/test-email.js
```

## 9. Initial Data Seeding

### 9.1 Seed Voice Profiles

```bash
# Run seed script
docker exec -it voice-generator npm run seed:voices

# Or manually import via SQL
docker exec -i supabase-db psql -U postgres < /opt/voice-generator/supabase/seed-voices.sql
```

This will populate `voicegen_voices` with 50+ pre-configured AI voices.

### 9.2 Create Admin User (Optional)

```sql
-- In Supabase SQL Editor
INSERT INTO voicegen_users (id, email, role, credits_balance)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@smartcamp.ai'),
  'admin@smartcamp.ai',
  'admin',
  999999999
);
```

## 10. Health Checks & Monitoring

### 10.1 Application Health

```bash
# Health check endpoint
curl https://voice.smartcamp.ai/api/health

# Expected response:
# {"status": "ok", "timestamp": "2025-11-18T..."}
```

### 10.2 Database Health

```bash
# Check Supabase connection
curl https://api.supabase.smartcamp.ai/rest/v1/

# Expected: 404 or authentication error (means API is running)
```

### 10.3 Set Up Uptime Monitoring

Use UptimeRobot or Cronitor:
- Monitor: `https://voice.smartcamp.ai/api/health`
- Interval: 5 minutes
- Alert: Email/SMS on failure

### 10.4 Error Tracking

If using Sentry:
```bash
# Add to .env.production
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...
```

## 11. SSL/TLS Verification

```bash
# Check SSL certificate
echo | openssl s_client -servername voice.smartcamp.ai -connect voice.smartcamp.ai:443 2>/dev/null | openssl x509 -noout -dates

# Verify HTTPS redirect
curl -I http://voice.smartcamp.ai
# Should see: 301 or 308 redirect to https://

# Test SSL rating
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=voice.smartcamp.ai
```

## 12. Performance Optimization

### 12.1 Enable Caching (Optional)

Add Redis for session/cache:
```yaml
# In docker-compose.yml
  redis:
    image: redis:7-alpine
    container_name: voice-redis
    restart: unless-stopped
    networks:
      - web
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

### 12.2 CDN for Static Assets (Optional)

Use Cloudflare or BunnyCDN:
1. Point DNS through CDN
2. Configure caching rules for `/\_next/static/\*`
3. Update CSP headers if needed

## 13. Backup Configuration

### 13.1 Automated Database Backup

Create backup script `/opt/voice-generator/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/voice-generator"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database (voicegen tables only)
docker exec supabase-db pg_dump -U postgres -d postgres \
  -t 'voicegen_*' | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup storage buckets
# (Supabase storage is already backed up at infrastructure level)

# Retain last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### 13.2 Schedule Backups

```bash
# Add to crontab
crontab -e

# Add line (daily at 2 AM)
0 2 * * * /opt/voice-generator/backup.sh >> /var/log/voice-backup.log 2>&1
```

## 14. Troubleshooting

### 14.1 Application Won't Start

```bash
# Check logs
docker-compose logs voice-generator

# Common issues:
# - Missing environment variables
# - Supabase connection failed
# - Port already in use
```

### 14.2 Database Connection Error

```bash
# Test Supabase connectivity
docker exec voice-generator wget -O- https://api.supabase.smartcamp.ai

# Check database URL is correct
docker exec voice-generator env | grep SUPABASE
```

### 14.3 SSL Certificate Not Working

```bash
# Check Traefik logs
docker logs traefik

# Verify DNS propagation
nslookup voice.smartcamp.ai

# Force certificate renewal
docker exec traefik traefik healthcheck
```

### 14.4 Voice Generation Fails

```bash
# Check API keys
docker exec voice-generator env | grep -E 'OPENAI|ELEVENLABS'

# Test AI provider directly
curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"
```

## 15. Updating the Application

### 15.1 Zero-Downtime Deployment

```bash
cd /opt/voice-generator

# Pull latest code
git pull origin main

# Build new image
docker build -t voice-generator:new .

# Update docker-compose to use new tag
sed -i 's/voice-generator:latest/voice-generator:new/' docker-compose.yml

# Deploy
docker-compose up -d

# Verify
curl -I https://voice.smartcamp.ai

# If successful, retag
docker tag voice-generator:new voice-generator:latest
docker rmi voice-generator:old
```

### 15.2 Database Migrations

```bash
# Run migrations
docker exec -i supabase-db psql -U postgres < migrations/001_add_new_feature.sql

# Or from app container
docker exec voice-generator npm run migrate
```

## 16. Security Checklist

- [ ] All environment variables set and secrets not in git
- [ ] Supabase RLS policies enabled and tested
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] Firewall configured (only 80, 443, 22 open)
- [ ] SSH key-only authentication (no password)
- [ ] Fail2ban active for SSH
- [ ] Docker containers run as non-root users
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] CSP headers set
- [ ] Regular backups scheduled
- [ ] Monitoring and alerts set up
- [ ] Stripe webhook secret validated
- [ ] API keys rotated regularly

## 17. Post-Deployment Verification

### 17.1 Functional Tests

- [ ] User can sign up
- [ ] User can log in
- [ ] User receives welcome email
- [ ] Free credits are assigned
- [ ] Voice generation works
- [ ] Audio file downloads
- [ ] Project creation works
- [ ] History is saved
- [ ] Settings can be updated
- [ ] Subscription upgrade works
- [ ] Invoice generation works

### 17.2 Performance Tests

```bash
# Basic load test with Apache Bench
ab -n 100 -c 10 https://voice.smartcamp.ai/

# Or use hey
hey -n 1000 -c 50 https://voice.smartcamp.ai/
```

### 17.3 Security Scan

```bash
# OWASP ZAP or similar
# Visit: https://www.zaproxy.org/

# Or use online scanner
# Visit: https://observatory.mozilla.org/
```

## 18. Support and Maintenance

**Regular Maintenance Schedule**:
- **Daily**: Monitor error logs, check uptime
- **Weekly**: Review disk space, check backups
- **Monthly**: Update dependencies, security patches
- **Quarterly**: Rotate API keys, audit access logs

**Useful Commands**:
```bash
# View application logs
docker-compose logs -f --tail=100 voice-generator

# Restart application
docker-compose restart voice-generator

# Check resource usage
docker stats voice-generator

# Clean up old images/containers
docker system prune -a
```

**Contact**:
- Technical Issues: admin@smartcamp.ai
- VPS Support: [Your VPS Provider]
- Supabase Support: https://supabase.com/support

## 19. Rollback Procedure

If deployment fails:

```bash
# Rollback to previous image
docker-compose down
docker tag voice-generator:previous voice-generator:latest
docker-compose up -d

# Or restore from backup
docker exec -i supabase-db psql -U postgres < /backups/voice-generator/db_YYYYMMDD.sql

# Check status
curl https://voice.smartcamp.ai/api/health
```

## 20. Scaling Recommendations

When to scale:
- CPU > 80% consistently
- Memory > 90%
- Response time > 1s
- More than 1000 concurrent users

Options:
1. **Vertical**: Upgrade VPS (more CPU/RAM)
2. **Horizontal**: Add more app instances behind Traefik
3. **Database**: PostgreSQL read replicas
4. **Caching**: Add Redis for sessions/cache
5. **CDN**: Offload static assets
6. **Separation**: Separate DB and app servers

---

**Configuration Complete! 🎉**

Your AI Voice Generator should now be running at:
**https://voice.smartcamp.ai**

Proceed with user testing and monitoring.
