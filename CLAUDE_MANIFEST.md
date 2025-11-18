# Claude Manifest - AI Voice Generator

> Quick orientation file for future Claude sessions

## Project Summary

**AI Voice Generator** by SmartCamp.AI - A professional web application for converting text to speech using AI voice models. Users can generate high-quality audio content, manage voice profiles, and organize projects. Built with a modern tech stack and deployed on VPS infrastructure.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL 15 via Supabase (self-hosted on VPS)
- **Storage**: Supabase Storage (S3-compatible)
- **Auth**: Supabase Auth (JWT)
- **AI/Voice**: OpenAI TTS API (primary), ElevenLabs (alternative)
- **Payments**: Stripe
- **Email**: Resend
- **Workflow Automation**: n8n (hosted on VPS)
- **PDF Generation**: Gotenberg (hosted on VPS)
- **AI Chatbot**: Flowise (hosted on VPS)
- **Deployment**: Docker on VPS with Traefik reverse proxy

## Project Namespace

**Database Prefix**: `voicegen_`
**Storage Buckets**: `voicegen-*`
**Domain**: `voice.smartcamp.ai`

All database objects (tables, functions, triggers) and storage buckets MUST use the `voicegen_` prefix or `voicegen-` prefix to avoid conflicts with other SmartCamp.AI projects on the shared VPS Supabase instance.

## Folder Structure

```
ai-voice-generator/
├── branding/               # SmartCamp.AI brand assets and guidelines
├── docs/                   # Technical documentation
│   └── ARCHITECTURE.md     # Detailed architecture
├── n8n/                    # n8n workflow definitions
├── public/                 # Static assets (images, fonts)
├── src/
│   ├── app/                # Next.js App Router (pages, layouts, API routes)
│   ├── components/         # React components (ui, layout, voice, project)
│   ├── lib/                # Core libraries (supabase, ai, stripe, email, n8n)
│   ├── hooks/              # React hooks
│   ├── types/              # TypeScript type definitions
│   ├── styles/             # Global CSS
│   └── config/             # Configuration files
├── supabase/               # Database schema, migrations, seed data
├── tests/                  # Unit, integration, E2E tests
├── scripts/                # Utility scripts
├── PRD.md                  # Product Requirements Document
├── VPS_TECHNICAL_DOCUMENTATION.md
├── VPS_CONFIGURATION_GUIDE.md
├── CLAUDE_MANIFEST.md      # This file
├── PROGRESS.md             # Implementation progress log
├── DECISIONS.md            # Technical decision log
├── BRANDING_IMPLEMENTATION.md
├── DEPLOYMENT.md           # Deployment instructions
├── API.md                  # API documentation
└── README.md               # Main readme
```

## How to Run

### Local Development

1. **Prerequisites**: Node.js 20+, npm/pnpm, Supabase CLI (optional)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials and API keys
   ```

4. **Run database migrations** (if using local Supabase):
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start dev server**:
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

### Production (VPS)

See `DEPLOYMENT.md` and `VPS_CONFIGURATION_GUIDE.md` for complete deployment instructions.

**Quick deploy**:
```bash
# Build Docker image
docker build -t voice-generator:latest .

# Deploy with docker-compose
docker-compose up -d

# Check logs
docker-compose logs -f
```

## Key Documentation

1. **PRD.md** - Product requirements, features, user flows
2. **docs/ARCHITECTURE.md** - Technical architecture, data model, API design
3. **branding/SmartCampAI_branding.md** - Design system, colors, typography, glassmorphism
4. **DEPLOYMENT.md** - Deployment steps, environment variables, configuration
5. **API.md** - API endpoints, authentication, request/response formats
6. **VPS_TECHNICAL_DOCUMENTATION.md** - VPS infrastructure overview
7. **VPS_CONFIGURATION_GUIDE.md** - Step-by-step VPS setup

## Important Files

- **Supabase Schema**: `supabase/schema.sql` - All database tables, RLS policies, indexes
- **Branding**: `branding/SmartCampAI_branding.md` - Complete design system
- **Docker**: `Dockerfile`, `docker-compose.yml` - Containerization
- **Config**: `next.config.js`, `tailwind.config.ts`, `tsconfig.json`
- **Environment**: `.env.example` - All required environment variables

## Environment Variables

See `.env.example` for complete list. Key variables:

```bash
# App
NEXT_PUBLIC_APP_URL=https://voice.smartcamp.ai
NODE_ENV=production

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://api.supabase.smartcamp.ai
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# AI Provider
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Email
EMAIL_API_KEY=...
EMAIL_FROM=noreply@smartcamp.ai

# n8n
N8N_WEBHOOK_BASE_URL=https://n8n.smartcamp.ai/webhook/
```

## Database Schema

All tables are prefixed with `voicegen_`:

- **voicegen_users** - User profiles (extends auth.users)
- **voicegen_projects** - User projects
- **voicegen_generations** - Voice generation history
- **voicegen_voices** - Available voice profiles (50+ pre-seeded)
- **voicegen_custom_voices** - Custom voice clones (Pro/Enterprise)
- **voicegen_credits** - Credit transaction ledger
- **voicegen_subscriptions** - Stripe subscription tracking
- **voicegen_api_keys** - API keys for external access
- **voicegen_webhooks** - User webhook configurations

**Storage Buckets**:
- **voicegen-audio** - Generated audio files
- **voicegen-voice-samples** - Voice cloning samples
- **voicegen-invoices** - PDF invoices

## Key Features

1. **Voice Generation**: Text-to-speech with 50+ AI voices
2. **Project Management**: Organize generations into projects
3. **Voice Library**: Browse, preview, favorite voices
4. **Credit System**: Pay-per-character with subscription tiers
5. **History**: Track all generations with filters
6. **Custom Voices**: Voice cloning (Pro/Enterprise)
7. **API Access**: REST API for programmatic access (Pro+)
8. **Integrations**: n8n workflows, Stripe payments, email notifications

## User Roles & Tiers

- **Free**: 10,000 credits/month, basic features
- **Pro**: $19/mo, 500,000 credits/month, custom voices, API access
- **Enterprise**: $99/mo, unlimited credits, priority support
- **Admin**: Full system access, user management

## External Services

- **Supabase**: `https://api.supabase.smartcamp.ai`
- **n8n**: `https://n8n.smartcamp.ai`
- **Flowise**: `https://flowise.smartcamp.ai`
- **Gotenberg**: `https://gotenberg.smartcamp.ai` (internal)
- **OpenAI**: `https://api.openai.com/v1`
- **Stripe**: `https://api.stripe.com/v1`

## Branding

**Design System**: SmartCamp.AI - Jungle-themed with glassmorphism
- **Colors**: Green/teal primary (#1EB571), warm amber accents
- **Typography**: Jost font family (Google Fonts)
- **Background**: Jungle scene with frosted glass overlays
- **Components**: Glass cards, gradient buttons, smooth animations

**Footer Requirement**: All pages must include:
```
© Created with ❤️ by SmartCamp.AI
```
Linking to `https://smartcamp.ai/`

## Development Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run test         # Run unit tests
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with voices
```

## Testing

- **Unit Tests**: Vitest + React Testing Library
- **Integration Tests**: API route testing
- **E2E Tests**: Playwright (optional)

Run: `npm run test`

## Common Tasks

### Add a new voice to the library
1. Insert into `voicegen_voices` table
2. Upload sample audio to Supabase Storage
3. Update voice provider mapping in `src/lib/ai/provider.ts`

### Create a new API endpoint
1. Add route in `src/app/api/<endpoint>/route.ts`
2. Implement with proper auth validation
3. Document in `API.md`

### Update branding/design
1. Check `branding/SmartCampAI_branding.md`
2. Update Tailwind config if needed
3. Update `BRANDING_IMPLEMENTATION.md`

### Deploy to production
1. Build Docker image: `docker build -t voice-generator:latest .`
2. Update `.env.production`
3. Run `docker-compose up -d`
4. Verify health: `curl https://voice.smartcamp.ai/api/health`

## Troubleshooting

**App won't start**:
- Check environment variables are set
- Verify Supabase connection
- Check Docker logs: `docker logs voice-generator`

**Database connection error**:
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Test: `curl https://api.supabase.smartcamp.ai`
- Check RLS policies allow access

**Voice generation fails**:
- Verify `OPENAI_API_KEY` is valid
- Check credit balance
- Review error in `voicegen_generations.error_message`

**SSL certificate issues**:
- Check DNS points to VPS
- Review Traefik logs
- Verify Let's Encrypt is working

## Links & Resources

- **Repository**: [Link to git repo]
- **Production**: https://voice.smartcamp.ai
- **Supabase Studio**: https://supabase-studio.smartcamp.ai (dev only)
- **n8n Dashboard**: https://n8n.smartcamp.ai
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs

## Decision Log

See `DECISIONS.md` for all technical decisions and trade-offs made during development.

## Progress Tracking

See `PROGRESS.md` for chronological implementation log and status updates.

## Support

- **Technical Issues**: See `TROUBLESHOOTING.md` or check Docker logs
- **Deployment Help**: See `VPS_CONFIGURATION_GUIDE.md`
- **API Questions**: See `API.md`
- **Design Questions**: See `branding/SmartCampAI_branding.md`

---

**Last Updated**: 2025-11-18
**Version**: 1.0.0
**Status**: Active Development
