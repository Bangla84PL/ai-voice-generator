# VPS Technical Documentation - SmartCamp.AI Infrastructure

## 1. Infrastructure Overview

**VPS Provider**: Hetzner / DigitalOcean / Similar
**Domain**: smartcamp.ai
**Operating System**: Ubuntu 22.04 LTS
**Architecture**: Docker-based microservices with Traefik reverse proxy

### Deployed Services
- **Traefik** - Reverse proxy and SSL management (Let's Encrypt)
- **Supabase** - PostgreSQL database, authentication, storage, edge functions
- **n8n** - Workflow automation and webhooks
- **Flowise** - AI chatbot and conversational AI
- **Gotenberg** - PDF generation service
- **Application Containers** - Next.js applications

### Service URLs
```
https://smartcamp.ai                    - Main website
https://voice.smartcamp.ai              - AI Voice Generator App
https://api.supabase.smartcamp.ai       - Supabase API
https://n8n.smartcamp.ai                - n8n Workflow Automation
https://flowise.smartcamp.ai            - Flowise AI Chatbot
https://gotenberg.smartcamp.ai          - Gotenberg PDF Service (internal)
```

## 2. Traefik Configuration

**Purpose**: Reverse proxy, automatic SSL, routing, load balancing

**Key Features**:
- Automatic SSL certificate management via Let's Encrypt
- HTTP to HTTPS redirection
- Docker provider for automatic service discovery
- Dashboard for monitoring

**Docker Network**: `web` (shared network for all services)

**Example Service Labels**:
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.myapp.rule=Host(`voice.smartcamp.ai`)"
  - "traefik.http.routers.myapp.entrypoints=websecure"
  - "traefik.http.routers.myapp.tls.certresolver=letsencrypt"
  - "traefik.http.services.myapp.loadbalancer.server.port=3000"
  - "traefik.docker.network=web"
```

## 3. Supabase on VPS

**Components**:
- PostgreSQL 15
- PostgREST (API)
- GoTrue (Authentication)
- Realtime (WebSockets)
- Storage (S3-compatible)
- Kong (API Gateway)

**Access Points**:
- **API URL**: `https://api.supabase.smartcamp.ai`
- **Database**: `postgresql://postgres:[password]@supabase-db:5432/postgres`
- **Studio**: `https://supabase-studio.smartcamp.ai` (optional, for development)

**Environment Variables**:
```bash
POSTGRES_PASSWORD=<secure-password>
JWT_SECRET=<random-256-bit-secret>
ANON_KEY=<generated-anon-key>
SERVICE_ROLE_KEY=<generated-service-role-key>
SITE_URL=https://voice.smartcamp.ai
```

**Multi-Project Strategy**:
Since Supabase is shared across multiple SmartCamp.AI projects:
- All tables/functions MUST be namespaced with project prefix
- Example: `voicegen_users`, `voicegen_projects`, `voicegen_credits`
- Storage buckets: `voicegen-audio`, `voicegen-samples`
- Database roles and RLS policies per project

## 4. n8n Workflow Automation

**Purpose**: Automation workflows, webhooks, scheduled tasks

**Access**:
- **URL**: `https://n8n.smartcamp.ai`
- **Webhook Base**: `https://n8n.smartcamp.ai/webhook/`
- **Authentication**: Basic auth or API key

**Common Workflows for Voice Generator**:
1. **User Onboarding**:
   - Trigger: New user signup (webhook from Supabase)
   - Actions: Send welcome email, create user record, assign free credits

2. **Voice Generation Complete**:
   - Trigger: Generation complete (webhook from app)
   - Actions: Update credits, notify user, save to history

3. **Subscription Management**:
   - Trigger: Stripe webhook
   - Actions: Update subscription status, adjust credits, send confirmation

4. **Invoice Generation**:
   - Trigger: Monthly billing cycle
   - Actions: Calculate usage, call Gotenberg for PDF, email invoice

5. **Usage Alerts**:
   - Trigger: Credit threshold reached (80%, 90%, 100%)
   - Actions: Send email notification, show in-app alert

**Integration Pattern**:
```javascript
// From Next.js app to n8n
await fetch('https://n8n.smartcamp.ai/webhook/voice-generation-complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    generationId: generation.id,
    creditsUsed: generation.characterCount,
    timestamp: new Date().toISOString()
  })
});
```

## 5. Flowise AI Chatbot

**Purpose**: Conversational AI for customer support and assistance

**Access**:
- **URL**: `https://flowise.smartcamp.ai`
- **API Endpoint**: `https://flowise.smartcamp.ai/api/v1/prediction/{chatflowId}`

**Use Cases**:
- In-app support chat widget
- FAQ automation
- Voice generation guidance
- Troubleshooting assistance

**Integration**:
```javascript
// Embedded chat widget
<script src="https://flowise.smartcamp.ai/embed.js"></script>
<flowise-chat
  chatflowid="<your-chatflow-id>"
  apihost="https://flowise.smartcamp.ai"
  theme="dark"
></flowise-chat>
```

**Knowledge Base**:
- Product documentation
- Common issues and solutions
- API documentation
- Pricing and billing FAQs

## 6. Gotenberg PDF Service

**Purpose**: Server-side PDF generation (invoices, reports, exports)

**Access**:
- **URL**: `https://gotenberg.smartcamp.ai` (internal only, not public)
- **API**: REST API for HTML to PDF, Markdown to PDF, etc.

**Common Use Cases**:
1. **Invoice Generation**:
   - HTML template → PDF
   - Branded invoices with usage details

2. **Reports**:
   - User activity reports
   - Analytics exports

3. **Documentation**:
   - Export voice generation history
   - Project summaries

**Example Usage**:
```javascript
// From Next.js API route
const formData = new FormData();
formData.append('files', htmlFile);
formData.append('marginTop', '0.5in');
formData.append('marginBottom', '0.5in');

const response = await fetch('https://gotenberg.smartcamp.ai/forms/chromium/convert/html', {
  method: 'POST',
  body: formData
});

const pdfBuffer = await response.arrayBuffer();
```

## 7. Docker Compose Structure

**Network**:
All services connected to `web` network for Traefik routing.

**Volumes**:
- Persistent storage for databases
- File storage for Supabase
- n8n workflow data
- Application data

**Example docker-compose.yml snippet**:
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
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - N8N_WEBHOOK_URL=${N8N_WEBHOOK_URL}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.voice.rule=Host(`voice.smartcamp.ai`)"
      - "traefik.http.routers.voice.entrypoints=websecure"
      - "traefik.http.routers.voice.tls.certresolver=letsencrypt"
      - "traefik.http.services.voice.loadbalancer.server.port=3000"
      - "traefik.docker.network=web"
```

## 8. Environment Variables

### Global VPS Environment
```bash
# Domain
DOMAIN=smartcamp.ai

# Traefik
TRAEFIK_DASHBOARD_AUTH=<htpasswd-hash>

# Let's Encrypt
LETSENCRYPT_EMAIL=admin@smartcamp.ai

# Supabase
SUPABASE_URL=https://api.supabase.smartcamp.ai
POSTGRES_PASSWORD=<secure-password>
JWT_SECRET=<256-bit-secret>
SUPABASE_ANON_KEY=<generated-key>
SUPABASE_SERVICE_ROLE_KEY=<generated-key>

# n8n
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=<secure-password>
N8N_WEBHOOK_URL=https://n8n.smartcamp.ai/webhook/

# Flowise
FLOWISE_USERNAME=admin
FLOWISE_PASSWORD=<secure-password>
```

### Application-Specific (Voice Generator)
```bash
# Next.js
NEXT_PUBLIC_APP_URL=https://voice.smartcamp.ai
NEXT_PUBLIC_SUPABASE_URL=https://api.supabase.smartcamp.ai
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# AI Voice Provider (e.g., OpenAI)
OPENAI_API_KEY=<openai-key>
# OR
ELEVENLABS_API_KEY=<elevenlabs-key>

# n8n Integration
N8N_WEBHOOK_BASE_URL=https://n8n.smartcamp.ai/webhook/

# Gotenberg
GOTENBERG_API_URL=https://gotenberg.smartcamp.ai

# Stripe (for payments)
STRIPE_SECRET_KEY=<stripe-secret>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<stripe-public>
STRIPE_WEBHOOK_SECRET=<webhook-secret>

# Email (SendGrid/Resend)
EMAIL_API_KEY=<email-api-key>
EMAIL_FROM=noreply@smartcamp.ai
```

## 9. Security Considerations

**SSL/TLS**:
- All services behind HTTPS (Traefik + Let's Encrypt)
- HSTS headers enabled
- TLS 1.2+ only

**Firewall**:
- Only ports 80, 443, 22 (SSH) open
- UFW or iptables configured
- Fail2ban for SSH protection

**Docker Security**:
- Non-root users in containers
- Read-only root filesystems where possible
- Limited container capabilities
- Network isolation

**Secrets Management**:
- Environment variables via .env files (not in git)
- Docker secrets for sensitive data
- Regular rotation of API keys and passwords

**Database Security**:
- PostgreSQL authentication required
- Row Level Security (RLS) enabled
- Regular backups
- Encrypted backups

**Application Security**:
- Rate limiting (via Traefik or app-level)
- CORS properly configured
- CSP headers
- Input validation and sanitization
- SQL injection prevention (use parameterized queries)
- XSS prevention

## 10. Backup Strategy

**Database Backups**:
- Daily automated backups of PostgreSQL
- Retention: 7 daily, 4 weekly, 12 monthly
- Encrypted and stored off-site

**File Storage Backups**:
- Supabase storage buckets backed up weekly
- Application volumes backed up daily

**Configuration Backups**:
- Docker compose files
- Traefik configuration
- Environment variables (encrypted)

**Backup Script Example**:
```bash
#!/bin/bash
# Backup Supabase database
docker exec supabase-db pg_dump -U postgres postgres | gzip > /backups/db_$(date +%Y%m%d).sql.gz

# Backup volumes
docker run --rm -v supabase-storage:/data -v /backups:/backup ubuntu tar czf /backup/storage_$(date +%Y%m%d).tar.gz /data
```

## 11. Monitoring & Logging

**Monitoring Tools**:
- Traefik dashboard
- Docker stats
- Uptime monitoring (UptimeRobot / Cronitor)
- Application-level monitoring (Sentry for errors)

**Logging**:
- Centralized logging with Docker logs
- Log rotation configured
- Application logs to stdout/stderr
- Error tracking with Sentry or similar

**Alerts**:
- Disk space warnings
- High CPU/memory usage
- Service downtime
- SSL certificate expiration

## 12. Deployment Process

### Initial Setup
1. Provision VPS (Ubuntu 22.04)
2. Install Docker and Docker Compose
3. Configure firewall (UFW)
4. Set up Traefik with Let's Encrypt
5. Deploy Supabase stack
6. Deploy n8n, Flowise, Gotenberg
7. Configure DNS records

### Application Deployment
1. Build Docker image locally or CI/CD
2. Push to registry (Docker Hub / GitHub Packages)
3. Pull image on VPS
4. Update docker-compose.yml
5. Run `docker-compose up -d`
6. Verify health checks
7. Monitor logs

### CI/CD Pipeline (Optional)
- GitHub Actions on push to main
- Build and test
- Build Docker image
- Push to registry
- Deploy to VPS via SSH
- Health checks and rollback if needed

## 13. Scaling Considerations

**Vertical Scaling**:
- Upgrade VPS resources (CPU, RAM, storage)
- Increase PostgreSQL connections
- Optimize database queries and indexes

**Horizontal Scaling** (Future):
- Multiple app instances behind Traefik load balancer
- PostgreSQL read replicas
- Redis for caching and session storage
- CDN for static assets
- Separate database and application servers

**Performance Optimization**:
- Database query optimization
- Caching strategies (Redis)
- Image optimization and CDN
- Code splitting and lazy loading
- Static generation where possible (Next.js ISR)

## 14. Maintenance

**Regular Tasks**:
- Weekly: Check disk space, review logs
- Monthly: Update Docker images, OS security patches
- Quarterly: Review and rotate secrets, audit access logs
- Yearly: SSL certificate renewal (automatic via Let's Encrypt)

**Update Process**:
```bash
# Update OS
apt update && apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d

# Clean up old images
docker system prune -a
```

## 15. Troubleshooting

**Common Issues**:

1. **Service not accessible**:
   - Check Traefik routing labels
   - Verify DNS records
   - Check container logs: `docker logs <container>`

2. **SSL certificate issues**:
   - Verify domain points to VPS
   - Check Let's Encrypt rate limits
   - Review Traefik logs

3. **Database connection errors**:
   - Check PostgreSQL is running
   - Verify connection strings
   - Check network connectivity

4. **High memory/CPU usage**:
   - Review container stats: `docker stats`
   - Check for memory leaks
   - Optimize queries and code

**Useful Commands**:
```bash
# View all running containers
docker ps

# View container logs
docker logs -f <container-name>

# Restart service
docker-compose restart <service-name>

# Access container shell
docker exec -it <container-name> /bin/bash

# Check network connectivity
docker network inspect web
```

## 16. Support Contacts

**VPS Provider**: [Provider support portal]
**Domain Registrar**: [Registrar support]
**SmartCamp.AI Technical**: admin@smartcamp.ai

**Documentation**:
- Traefik: https://doc.traefik.io/traefik/
- Supabase: https://supabase.com/docs
- n8n: https://docs.n8n.io/
- Flowise: https://docs.flowiseai.com/
- Gotenberg: https://gotenberg.dev/docs/about
