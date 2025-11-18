# AI Voice Generator - Technical Architecture

## 1. System Architecture Overview

**Architecture Pattern**: Modular monolith with serverless edge functions
**Deployment**: Containerized Next.js application on VPS with microservices

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │    Mobile    │  │   API Client │          │
│  │  (Next.js)   │  │   (Future)   │  │  (External)  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       TRAEFIK (Reverse Proxy)                    │
│                SSL Termination & Load Balancing                  │
└─────────────────────────────────────────────────────────────────┘
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
          ▼                                     ▼
┌──────────────────────┐            ┌──────────────────────┐
│   APPLICATION LAYER  │            │   EXTERNAL SERVICES  │
│   (Next.js App)      │            │                      │
│                      │            │  ├─ Supabase        │
│  ├─ Pages/Routes     │            │  ├─ n8n             │
│  ├─ API Routes       │◄───────────┤  ├─ Flowise         │
│  ├─ Server Actions   │            │  ├─ Gotenberg       │
│  ├─ Components       │            │  ├─ OpenAI/11Labs   │
│  └─ Business Logic   │            │  ├─ Stripe          │
└──────────┬───────────┘            │  └─ Email Provider  │
           │                        └──────────────────────┘
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│                                                                  │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │   Supabase Postgres  │      │   Supabase Storage   │        │
│  │                      │      │                      │        │
│  │  ├─ voicegen_users   │      │  ├─ voicegen-audio  │        │
│  │  ├─ voicegen_projects│      │  ├─ voicegen-samples│        │
│  │  ├─ voicegen_gens    │      │  └─ voicegen-invoices│       │
│  │  ├─ voicegen_voices  │      │                      │        │
│  │  └─ ... (10+ tables) │      │                      │        │
│  └──────────────────────┘      └──────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Technology Stack

### 2.1 Frontend
- **Framework**: Next.js 14.x (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: React 18.x
- **Styling**: Tailwind CSS 3.x
- **Component Library**: shadcn/ui (customized for SmartCamp.AI)
- **State Management**: React Context + Zustand (for complex state)
- **Forms**: React Hook Form + Zod validation
- **Audio**: Wavesurfer.js (waveform visualization)
- **Charts**: Recharts (analytics dashboards)
- **Icons**: Lucide Icons

### 2.2 Backend
- **Runtime**: Node.js 20.x
- **API**: Next.js API Routes & Server Actions
- **Database ORM**: Supabase JS Client
- **Authentication**: Supabase Auth (JWT)
- **File Upload**: Supabase Storage
- **Real-time**: Supabase Realtime (optional)

### 2.3 Infrastructure
- **Hosting**: Docker on VPS (Ubuntu 22.04)
- **Reverse Proxy**: Traefik 2.x
- **Database**: PostgreSQL 15 (via Supabase)
- **Object Storage**: Supabase Storage (S3-compatible)
- **Workflow Engine**: n8n
- **PDF Service**: Gotenberg
- **AI Assistant**: Flowise

### 2.4 AI/ML Services
- **Primary Voice Provider**: OpenAI TTS API
- **Alternative**: ElevenLabs API
- **Fallback**: Azure Speech Service (optional)

### 2.5 Third-Party Services
- **Payments**: Stripe
- **Email**: Resend / SendGrid
- **Analytics**: Plausible (privacy-focused)
- **Error Tracking**: Sentry (optional)
- **Monitoring**: UptimeRobot + Docker stats

### 2.6 Development Tools
- **Package Manager**: npm / pnpm
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright (optional)
- **Git Hooks**: Husky + lint-staged

## 3. Module Structure

```
ai-voice-generator/
├── .github/                    # GitHub Actions CI/CD
│   └── workflows/
│       └── deploy.yml
├── .husky/                     # Git hooks
├── branding/                   # Brand assets
│   ├── SmartCampAI_branding.md
│   ├── logo.svg
│   ├── jungle-background.jpg
│   └── ...
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── ...
├── n8n/                        # n8n workflows
│   └── workflows/
│       ├── user-onboarding.json
│       ├── generation-complete.json
│       └── ...
├── public/                     # Static assets
│   ├── images/
│   ├── fonts/
│   └── ...
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth routes group
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── reset-password/
│   │   ├── (dashboard)/        # Dashboard routes group
│   │   │   ├── dashboard/
│   │   │   ├── generate/
│   │   │   ├── projects/
│   │   │   ├── history/
│   │   │   ├── library/
│   │   │   ├── settings/
│   │   │   └── layout.tsx      # Dashboard layout
│   │   ├── api/                # API routes
│   │   │   ├── auth/
│   │   │   ├── generate/
│   │   │   ├── projects/
│   │   │   ├── voices/
│   │   │   ├── webhooks/
│   │   │   └── health/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   ├── pricing/
│   │   └── docs/
│   ├── components/             # React components
│   │   ├── ui/                 # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── layout/             # Layout components
│   │   │   ├── navbar.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── glass-container.tsx
│   │   ├── voice/              # Voice-specific components
│   │   │   ├── voice-selector.tsx
│   │   │   ├── audio-player.tsx
│   │   │   ├── generation-form.tsx
│   │   │   └── waveform-visualizer.tsx
│   │   ├── project/            # Project components
│   │   │   ├── project-card.tsx
│   │   │   ├── project-list.tsx
│   │   │   └── project-form.tsx
│   │   └── shared/             # Shared components
│   │       ├── loading-spinner.tsx
│   │       ├── error-boundary.tsx
│   │       └── ...
│   ├── lib/                    # Core libraries
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser client
│   │   │   ├── server.ts       # Server client
│   │   │   ├── middleware.ts   # Auth middleware
│   │   │   └── admin.ts        # Service role client
│   │   ├── ai/
│   │   │   ├── openai.ts       # OpenAI integration
│   │   │   ├── elevenlabs.ts   # ElevenLabs integration
│   │   │   └── provider.ts     # Abstract provider
│   │   ├── stripe/
│   │   │   ├── client.ts
│   │   │   └── webhooks.ts
│   │   ├── email/
│   │   │   ├── client.ts
│   │   │   └── templates.ts
│   │   ├── n8n/
│   │   │   └── webhooks.ts
│   │   └── utils/
│   │       ├── logger.ts
│   │       ├── errors.ts
│   │       └── validation.ts
│   ├── hooks/                  # React hooks
│   │   ├── use-user.ts
│   │   ├── use-credits.ts
│   │   ├── use-voice-generation.ts
│   │   └── use-audio-player.ts
│   ├── types/                  # TypeScript types
│   │   ├── database.ts         # Supabase generated types
│   │   ├── api.ts
│   │   ├── voice.ts
│   │   └── project.ts
│   ├── styles/                 # Global styles
│   │   ├── globals.css
│   │   └── branding.css
│   └── config/                 # Configuration
│       ├── site.ts             # Site config
│       ├── navigation.ts       # Nav config
│       └── pricing.ts          # Pricing tiers
├── supabase/                   # Supabase files
│   ├── schema.sql              # Database schema
│   ├── migrations/             # SQL migrations
│   ├── seed.sql                # Seed data
│   └── functions/              # Edge functions (if needed)
├── tests/                      # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/                    # Utility scripts
│   ├── seed-voices.ts
│   ├── generate-types.ts
│   └── backup.sh
├── .env.example                # Environment template
├── .env.local                  # Local development (gitignored)
├── .env.production             # Production (gitignored)
├── Dockerfile                  # Docker image
├── docker-compose.yml          # Docker composition
├── next.config.js              # Next.js config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
├── package.json
├── README.md
├── CLAUDE_MANIFEST.md          # Claude orientation
├── PROGRESS.md                 # Implementation log
├── DECISIONS.md                # Decision log
├── BRANDING_IMPLEMENTATION.md  # Branding guide
└── DEPLOYMENT.md               # Deployment guide
```

## 4. Data Model

### 4.1 Core Entities

**User** (extends Supabase auth.users)
- id (uuid, PK)
- email
- created_at
- metadata (JSONB)

**voicegen_users** (User profiles)
- id (uuid, PK, FK to auth.users)
- email (text)
- full_name (text)
- avatar_url (text)
- role (enum: user, pro, enterprise, admin)
- credits_balance (integer)
- subscription_id (uuid, FK)
- api_key_hash (text, nullable)
- preferences (JSONB)
- created_at (timestamp)
- updated_at (timestamp)

**voicegen_projects**
- id (uuid, PK)
- user_id (uuid, FK)
- name (text)
- description (text)
- settings (JSONB) - default voice, speed, etc.
- created_at (timestamp)
- updated_at (timestamp)

**voicegen_generations**
- id (uuid, PK)
- user_id (uuid, FK)
- project_id (uuid, FK, nullable)
- text (text)
- character_count (integer)
- voice_id (uuid, FK)
- settings (JSONB) - speed, pitch, tone, format
- status (enum: pending, processing, completed, failed)
- audio_url (text, nullable)
- audio_duration (float, nullable)
- credits_used (integer)
- error_message (text, nullable)
- created_at (timestamp)
- completed_at (timestamp, nullable)

**voicegen_voices**
- id (uuid, PK)
- name (text)
- provider (enum: openai, elevenlabs, azure)
- provider_voice_id (text)
- gender (enum: male, female, neutral)
- age (enum: young, adult, senior)
- accent (text) - e.g., "US", "UK", "Australian"
- language (text) - ISO code
- description (text)
- sample_url (text)
- tags (text[])
- is_premium (boolean)
- is_active (boolean)
- created_at (timestamp)

**voicegen_custom_voices** (Pro/Enterprise)
- id (uuid, PK)
- user_id (uuid, FK)
- name (text)
- sample_audio_url (text)
- provider_model_id (text, nullable)
- status (enum: pending, training, ready, failed)
- created_at (timestamp)

**voicegen_credits**
- id (uuid, PK)
- user_id (uuid, FK)
- amount (integer) - positive for credit, negative for debit
- type (enum: purchase, subscription, generation, refund, bonus)
- description (text)
- reference_id (uuid, nullable) - FK to generation or transaction
- created_at (timestamp)

**voicegen_subscriptions**
- id (uuid, PK)
- user_id (uuid, FK)
- stripe_subscription_id (text)
- stripe_customer_id (text)
- plan (enum: pro, enterprise)
- status (enum: active, canceled, past_due, paused)
- current_period_start (timestamp)
- current_period_end (timestamp)
- cancel_at_period_end (boolean)
- created_at (timestamp)
- updated_at (timestamp)

**voicegen_api_keys**
- id (uuid, PK)
- user_id (uuid, FK)
- name (text)
- key_hash (text) - bcrypt hash
- key_prefix (text) - first 8 chars for display
- last_used_at (timestamp, nullable)
- expires_at (timestamp, nullable)
- is_active (boolean)
- created_at (timestamp)

**voicegen_webhooks**
- id (uuid, PK)
- user_id (uuid, FK)
- url (text)
- events (text[]) - e.g., ["generation.completed"]
- secret (text) - for signing payloads
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)

### 4.2 Relationships

```
auth.users (1) ──< (1) voicegen_users
voicegen_users (1) ──< (N) voicegen_projects
voicegen_users (1) ──< (N) voicegen_generations
voicegen_users (1) ──< (N) voicegen_custom_voices
voicegen_users (1) ──< (N) voicegen_credits
voicegen_users (1) ──< (1) voicegen_subscriptions
voicegen_users (1) ──< (N) voicegen_api_keys
voicegen_users (1) ──< (N) voicegen_webhooks

voicegen_projects (1) ──< (N) voicegen_generations
voicegen_voices (1) ──< (N) voicegen_generations
```

### 4.3 Storage Buckets

**voicegen-audio**
- Purpose: Store generated audio files
- Path structure: `{user_id}/{generation_id}.{format}`
- Public: No (authenticated access only)
- RLS: User can access their own files

**voicegen-voice-samples**
- Purpose: Store voice cloning samples
- Path structure: `{user_id}/{custom_voice_id}/{sample_id}.wav`
- Public: No
- RLS: User can access their own samples

**voicegen-invoices**
- Purpose: Store generated PDF invoices
- Path structure: `{user_id}/{year}/{month}/invoice_{id}.pdf`
- Public: No
- RLS: User can access their own invoices

## 5. API Architecture

### 5.1 REST API Endpoints

**Authentication**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset-password` - Password reset
- `GET /api/auth/session` - Get current session

**Voice Generation**
- `POST /api/generate` - Create generation job
- `GET /api/generate/{id}` - Get generation status
- `DELETE /api/generate/{id}` - Cancel/delete generation
- `GET /api/generate/{id}/download` - Download audio file

**Projects**
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project details
- `PATCH /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `GET /api/projects/{id}/generations` - List project generations

**Voices**
- `GET /api/voices` - List available voices (with filters)
- `GET /api/voices/{id}` - Get voice details
- `GET /api/voices/{id}/preview` - Get preview audio
- `POST /api/voices/custom` - Create custom voice (Pro+)
- `GET /api/voices/custom` - List user custom voices

**History**
- `GET /api/history` - Get generation history (paginated)

**Credits**
- `GET /api/credits/balance` - Get current balance
- `GET /api/credits/transactions` - Get credit history
- `POST /api/credits/purchase` - Purchase credits (Stripe Checkout)

**Subscriptions**
- `GET /api/subscriptions` - Get user subscription
- `POST /api/subscriptions/checkout` - Create Stripe Checkout session
- `POST /api/subscriptions/cancel` - Cancel subscription
- `POST /api/subscriptions/resume` - Resume subscription

**API Keys** (Pro+)
- `GET /api/keys` - List user API keys
- `POST /api/keys` - Create new API key
- `DELETE /api/keys/{id}` - Revoke API key

**Webhooks**
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `POST /api/webhooks/n8n` - n8n callback handler

**Utility**
- `GET /api/health` - Health check
- `GET /api/stats` - User statistics

### 5.2 External Webhooks (to n8n)

- `POST https://n8n.smartcamp.ai/webhook/user-onboarding`
- `POST https://n8n.smartcamp.ai/webhook/generation-complete`
- `POST https://n8n.smartcamp.ai/webhook/credit-threshold`
- `POST https://n8n.smartcamp.ai/webhook/subscription-changed`

## 6. Authentication & Authorization

### 6.1 Authentication Flow
1. User signs up/logs in via Supabase Auth
2. Supabase issues JWT access token + refresh token
3. Client stores tokens in httpOnly cookies (via middleware)
4. All API requests include JWT in Authorization header
5. Middleware validates JWT and attaches user to request

### 6.2 Row Level Security (RLS)

All tables have RLS enabled with policies:

**voicegen_users**:
- Users can read their own profile
- Users can update their own profile (except role, credits_balance)
- Service role can do anything

**voicegen_projects**:
- Users can CRUD their own projects

**voicegen_generations**:
- Users can read/create/delete their own generations

**voicegen_voices**:
- All authenticated users can read active voices
- Only admins can CRUD voices

**voicegen_custom_voices**:
- Users can CRUD their own custom voices

**voicegen_credits**:
- Users can read their own credit transactions
- Only service role can insert/update

**voicegen_subscriptions**:
- Users can read their own subscription
- Only service role can CRUD

### 6.3 API Key Authentication (Pro+)

For external API access:
1. User generates API key in settings
2. API key stored as bcrypt hash in `voicegen_api_keys`
3. External requests include `Authorization: Bearer {api_key}`
4. Middleware validates key and attaches user

## 7. Business Logic

### 7.1 Voice Generation Flow

1. **Validation**:
   - Check user has sufficient credits
   - Validate text length (max 10,000 chars)
   - Validate voice exists and is accessible

2. **Credit Hold**:
   - Calculate cost (1 credit = 1 character)
   - Create pending debit in `voicegen_credits`

3. **Job Creation**:
   - Insert record in `voicegen_generations` (status: pending)
   - Queue job (in-process or background worker)

4. **Processing**:
   - Update status to "processing"
   - Call AI provider API (OpenAI/ElevenLabs)
   - Stream or download audio

5. **Storage**:
   - Upload audio to Supabase Storage
   - Get signed URL (1 year expiry)

6. **Completion**:
   - Update generation (status: completed, audio_url, duration)
   - Finalize credit debit
   - Trigger webhook to n8n (notify user)

7. **Error Handling**:
   - If failure, update status to "failed" with error message
   - Refund credits (delete pending debit)
   - Notify user

### 7.2 Credit System

**Credit Rules**:
- 1 credit = 1 character of text
- Free tier: 10,000 credits/month (resets 1st of month)
- Pro tier: 500,000 credits/month
- Enterprise: Unlimited
- Unused credits expire at end of billing period
- Purchased credit packs never expire

**Credit Operations**:
- **Grant**: New user bonus, subscription renewal, purchase
- **Debit**: Voice generation
- **Refund**: Failed generation, subscription downgrade
- **Bonus**: Referrals, promotions

### 7.3 Subscription Management

**Plans**:
- Free: $0, 10k credits/month
- Pro: $19/month, 500k credits/month, custom voices, API access
- Enterprise: $99/month, unlimited, priority support, white-label (future)

**Lifecycle**:
1. User clicks "Upgrade" → Stripe Checkout
2. Stripe webhook → Update `voicegen_subscriptions`
3. Grant monthly credits → `voicegen_credits`
4. On renewal: Grant new credits
5. On cancellation: Set `cancel_at_period_end = true`
6. On period end: Downgrade to Free, revoke Pro features

## 8. Security Architecture

### 8.1 Layers of Security

1. **Network**: HTTPS only, Traefik SSL, firewall
2. **Application**: Input validation, CSRF, XSS prevention
3. **API**: Rate limiting, authentication, authorization
4. **Database**: RLS policies, parameterized queries
5. **Storage**: Signed URLs, RLS on buckets

### 8.2 Rate Limiting

**Per User**:
- API requests: 100 req/min
- Generations: 10 concurrent, 100/hour
- API key requests: 1000 req/hour (Pro+)

**Per IP** (anonymous):
- Login attempts: 5/15min
- Signup: 3/hour

Implementation: In-memory cache or Redis

### 8.3 Data Privacy

**User Data**:
- Voice generations not used for training (explicit)
- Audio files deleted after 90 days (Free tier) or 1 year (Pro+)
- User can request data export (GDPR)
- User can request data deletion

**Compliance**:
- GDPR-ready (EU users)
- Cookie consent banner
- Privacy Policy & Terms of Service

## 9. Performance Considerations

### 9.1 Caching Strategy

**Client-side**:
- Voice library: Cache in sessionStorage (1 hour)
- User profile: React Query cache (5 min)
- Static assets: Browser cache (1 year)

**Server-side**:
- Voice metadata: Redis cache (1 hour)
- User credits: Redis cache (5 min, invalidate on change)

**CDN**:
- Static assets (/\_next/static): CDN edge cache

### 9.2 Database Optimization

**Indexes**:
- `voicegen_generations(user_id, created_at DESC)` - for history
- `voicegen_generations(status)` - for job processing
- `voicegen_voices(language, is_active)` - for filtering
- `voicegen_credits(user_id, created_at DESC)` - for transactions

**Partitioning** (future):
- Partition `voicegen_generations` by month
- Archive old generations to separate table

### 9.3 Scalability

**Current** (single VPS):
- ~1000 concurrent users
- ~100 req/sec

**Future** (horizontal scale):
- Multiple Next.js instances behind Traefik
- PostgreSQL read replicas
- Redis for shared cache
- Background job queue (Bull/BullMQ)
- Separate AI processing workers

## 10. Monitoring & Observability

### 10.1 Logging

**Application Logs**:
- Winston or Pino logger
- Structured JSON logs
- Log levels: error, warn, info, debug
- Sensitive data redacted

**Log Aggregation**:
- Docker logs → stdout/stderr
- Optional: Loki or ELK stack

### 10.2 Metrics

**Key Metrics**:
- Request rate (req/sec)
- Response time (p50, p95, p99)
- Error rate (%)
- Generation time (avg, p95)
- Credit consumption rate
- Active users (DAU, MAU)
- Conversion rate (free → paid)

**Tools**:
- Application: Custom /api/metrics endpoint
- Infrastructure: Docker stats, Prometheus (optional)

### 10.3 Alerts

**Critical**:
- App down (uptime < 95%)
- Database connection lost
- Disk space > 90%
- Error rate > 5%

**Warning**:
- Response time > 1s (p95)
- Memory usage > 80%
- Generation failures > 2%

**Channels**: Email, Slack webhook

## 11. Disaster Recovery

### 11.1 Backup Strategy

**Database**:
- Daily automated backups (2 AM UTC)
- Retention: 7 days, 4 weeks, 12 months
- Encrypted and stored off-site

**Storage**:
- Weekly bucket backups
- Retention: 4 weeks

**Configurations**:
- Git repository for code
- Encrypted .env backups

### 11.2 Recovery Procedures

**Database corruption**:
1. Stop application
2. Restore from latest backup
3. Replay WAL logs if available
4. Verify data integrity
5. Restart application

**Complete VPS failure**:
1. Provision new VPS
2. Restore Traefik + Supabase
3. Restore database from backup
4. Restore application configuration
5. Update DNS (if IP changed)
6. Verify all services

**RTO** (Recovery Time Objective): < 4 hours
**RPO** (Recovery Point Objective): < 24 hours

## 12. Development Workflow

### 12.1 Local Development

```bash
# Clone repo
git clone <repo> && cd ai-voice-generator

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with local Supabase credentials

# Run database migrations (local Supabase)
npm run db:migrate

# Seed database
npm run db:seed

# Start dev server
npm run dev
# Open http://localhost:3000
```

### 12.2 Testing

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests (Playwright)
npm run test:e2e

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

### 12.3 CI/CD Pipeline

**On Push** (GitHub Actions):
1. Checkout code
2. Install dependencies
3. Lint + Type check
4. Run tests
5. Build Next.js app
6. Build Docker image
7. Push to registry

**On Main Branch**:
1. Above steps
2. Tag image with version
3. Deploy to VPS (SSH)
4. Run database migrations
5. Health check
6. Notify team (Slack)

### 12.4 Git Workflow

- **Main branch**: Production-ready code
- **Develop branch**: Integration branch
- **Feature branches**: `feature/voice-cloning`
- **Hotfix branches**: `hotfix/credit-calculation-bug`

**Commit Messages**: Conventional Commits
- `feat: add voice preview feature`
- `fix: correct credit calculation`
- `docs: update API documentation`
- `refactor: simplify generation logic`

## 13. Future Enhancements

### Phase 2 (Month 2-3)
- Voice cloning (custom voices)
- Audio editing (trim, concatenate)
- Team collaboration (shared projects)
- API v2 (versioned, more endpoints)
- Mobile apps (React Native)

### Phase 3 (Month 4-6)
- Voice marketplace (users sell custom voices)
- Multi-language expansion (20+ languages)
- Advanced analytics dashboard
- Enterprise SSO (SAML)
- White-label offering

### Phase 4 (Month 7-12)
- Real-time voice generation (streaming)
- Video dubbing (voice + lip sync)
- Voice-to-voice conversion
- AI voice coaching (improve your voice)
- Blockchain voice NFTs (optional)

## 14. Appendix

### 14.1 Tech Decision Log

**Why Next.js?**
- Full-stack framework (frontend + API)
- App Router for modern patterns
- Great DX, TypeScript support
- Easy deployment

**Why Supabase?**
- PostgreSQL (proven, scalable)
- Built-in auth, storage, realtime
- VPS self-hosted (cost control, data ownership)
- Open source

**Why Tailwind?**
- Utility-first, fast development
- Great for design systems
- Small bundle size
- Community plugins

**Why OpenAI TTS?**
- High quality voices
- Reasonable pricing
- Simple API
- Multi-language support

**Why Stripe?**
- Industry standard
- Great developer experience
- Built-in subscription management
- Strong security

### 14.2 References

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OpenAI TTS API](https://platform.openai.com/docs/guides/text-to-speech)
- [Stripe Docs](https://stripe.com/docs)
- [SmartCamp.AI Branding](../branding/SmartCampAI_branding.md)
- [PRD](../PRD.md)
