# Technical Decisions Log

> Record of all important technical decisions, trade-offs, and rationale

## Decision Log

### D001: Tech Stack Selection (2025-11-18)

**Context**: Need to choose core technologies for AI Voice Generator

**Options Considered**:
1. Next.js + Supabase + TypeScript
2. Remix + Supabase + TypeScript
3. SvelteKit + Supabase + TypeScript
4. MERN stack (MongoDB + Express + React + Node)

**Decision**: Next.js 14 (App Router) + Supabase + TypeScript

**Rationale**:
- Next.js has best DX, great performance, strong ecosystem
- App Router provides modern patterns (Server Components, Server Actions)
- Supabase offers auth + database + storage in one platform
- VPS self-hosted Supabase gives data ownership and cost control
- TypeScript ensures type safety and better DX
- Tailwind CSS for rapid UI development with design system

**Trade-offs**:
- ✅ Pros: Fast development, great DX, proven stack, scalable
- ❌ Cons: Next.js learning curve (App Router is new), vendor lock-in to Vercel patterns

---

### D002: Database Namespacing (2025-11-18)

**Context**: Supabase instance is shared across multiple SmartCamp.AI projects

**Options Considered**:
1. Separate database per project (multiple PostgreSQL instances)
2. Separate schema per project (within same database)
3. Table prefix namespacing (all tables in public schema with prefix)

**Decision**: Table prefix namespacing with `voicegen_` prefix

**Rationale**:
- Simplest to manage on shared VPS Supabase
- Avoids cross-schema complexity in Supabase (RLS, Realtime)
- Clear naming convention prevents collisions
- Easier to migrate or separate later if needed
- Consistent with Supabase best practices for multi-tenancy

**Trade-offs**:
- ✅ Pros: Simple, clear, easy to manage, Supabase-friendly
- ❌ Cons: Longer table names, manual enforcement of prefix

**Implementation**:
- All tables: `voicegen_*`
- All storage buckets: `voicegen-*`
- All functions: `voicegen_*`

---

### D003: AI Voice Provider (2025-11-18)

**Context**: Need to select primary AI voice generation provider

**Options Considered**:
1. OpenAI TTS API
2. ElevenLabs API
3. Azure Speech Service
4. Google Cloud Text-to-Speech
5. AWS Polly

**Decision**: OpenAI TTS API (primary), ElevenLabs (premium alternative)

**Rationale**:
- OpenAI TTS: Good quality, reasonable pricing ($15/1M chars), simple API, multi-language
- ElevenLabs: Higher quality, more voices, but more expensive ($0.30/1K chars)
- Use OpenAI for standard/free tier, ElevenLabs for premium voices
- Can add more providers later without major refactor (abstraction layer)

**Trade-offs**:
- ✅ Pros: Proven quality, good pricing, simple integration, multi-provider strategy
- ❌ Cons: API dependency, costs scale with usage, rate limits

**Implementation**:
- Abstract provider interface in `src/lib/ai/provider.ts`
- Environment variable to switch providers
- Per-voice provider mapping in database

---

### D004: Credit System Design (2025-11-18)

**Context**: Need pricing model and credit consumption tracking

**Options Considered**:
1. Pay per generation (flat fee per audio file)
2. Pay per character (variable cost based on text length)
3. Pay per second of audio (output-based pricing)
4. Unlimited with rate limiting

**Decision**: Pay per character (1 credit = 1 character)

**Rationale**:
- Most transparent and predictable for users
- Aligns with AI provider pricing (OpenAI charges per char)
- Easy to calculate cost before generation
- Fair - users pay for what they use
- Matches industry standard (ElevenLabs, Play.ht use char-based)

**Trade-offs**:
- ✅ Pros: Transparent, predictable, fair, industry-standard
- ❌ Cons: Need accurate character counting, need to handle refunds

**Implementation**:
- Transaction ledger in `voicegen_credits` table
- Pre-calculate cost, hold credits, finalize on completion
- Refund on failure
- Monthly credit allocations for subscription tiers

---

### D005: Subscription Tiers (2025-11-18)

**Context**: Define pricing tiers and features

**Options Considered**:
1. Free + Pro ($9/mo) + Enterprise ($49/mo)
2. Free + Pro ($19/mo) + Enterprise ($99/mo)
3. Free + Basic ($5/mo) + Pro ($15/mo) + Enterprise ($50/mo)

**Decision**: Free + Pro ($19/mo) + Enterprise ($99/mo)

**Rationale**:
- Free tier (10k chars/month): Generous trial, attracts users, ~5-10 short generations
- Pro tier ($19/mo, 500k chars): Sweet spot for content creators, competitive pricing
- Enterprise ($99/mo, unlimited): For businesses, agencies, high-volume users
- Simple 3-tier model easy to understand
- Price points align with competitors (ElevenLabs $22/mo, Murf $19/mo)

**Trade-offs**:
- ✅ Pros: Simple, competitive, good value at each tier
- ❌ Cons: Free tier may be too generous (can adjust later)

**Features by Tier**:
- Free: 10k credits/month, standard voices, watermark (optional)
- Pro: 500k credits/month, all voices, custom voices, API access, no watermark
- Enterprise: Unlimited, priority support, team features, white-label (future)

---

### D006: Glassmorphism Over Jungle Background (2025-11-18)

**Context**: Need to match SmartCamp.AI branding - jungle theme + modern UI

**Options Considered**:
1. Solid color backgrounds (no jungle)
2. Jungle background with solid overlays
3. Jungle background with glassmorphism (frosted glass effect)
4. Jungle background with gradient overlays

**Decision**: Jungle background with glassmorphism overlays

**Rationale**:
- Matches SmartCamp.AI brand identity (nature + technology)
- Glassmorphism is modern, professional, visually appealing
- Creates depth and hierarchy
- Ensures readability over complex backgrounds
- Differentiates from competitors (unique visual identity)

**Trade-offs**:
- ✅ Pros: Beautiful, unique, on-brand, modern
- ❌ Cons: Performance (backdrop-filter), browser compatibility (need fallback)

**Implementation**:
- Tailwind utilities for glass effect
- Fallback for older browsers (solid backgrounds)
- Optimized background image (webp, lazy load)
- CSS variables for consistent glass tokens

---

### D007: Authentication Strategy (2025-11-18)

**Context**: Need secure, user-friendly authentication

**Options Considered**:
1. Custom auth (JWT, sessions, password hashing)
2. NextAuth.js
3. Supabase Auth
4. Auth0 / Clerk

**Decision**: Supabase Auth

**Rationale**:
- Already using Supabase for database/storage
- Built-in email/password + OAuth providers
- JWT tokens with RLS integration
- Email verification, password reset included
- No additional cost
- Proven, secure, actively maintained

**Trade-offs**:
- ✅ Pros: Integrated, secure, feature-complete, no extra cost
- ❌ Cons: Some vendor lock-in (but can migrate if needed)

**Implementation**:
- Email/password as primary
- Google OAuth (future: GitHub, etc.)
- Server-side session validation
- RLS policies use auth.uid()

---

### D008: File Storage Strategy (2025-11-18)

**Context**: Need to store generated audio files securely and efficiently

**Options Considered**:
1. Local filesystem (Docker volumes)
2. Supabase Storage
3. AWS S3
4. Cloudflare R2

**Decision**: Supabase Storage

**Rationale**:
- Already using Supabase infrastructure
- RLS for fine-grained access control
- S3-compatible API (easy to migrate later)
- CDN integration
- Included in VPS deployment
- Signed URLs for secure downloads

**Trade-offs**:
- ✅ Pros: Integrated, secure, RLS, no extra cost
- ❌ Cons: Storage limits on VPS (can add external bucket later)

**Implementation**:
- Buckets: `voicegen-audio`, `voicegen-voice-samples`, `voicegen-invoices`
- RLS policies: Users access own files only
- Signed URLs with 1-year expiry for audio
- Automatic cleanup of old files (90 days for Free tier)

---

### D009: API Design Pattern (2025-11-18)

**Context**: Need RESTful API for voice generation and management

**Options Considered**:
1. REST API (Next.js API Routes)
2. GraphQL (Apollo Server)
3. tRPC
4. Server Actions only (no public API)

**Decision**: REST API with Next.js API Routes + Server Actions for internal use

**Rationale**:
- REST is simple, widely understood, easy to document
- Next.js API Routes integrate perfectly
- Easy for external clients to consume (Pro+ users)
- Server Actions for internal app logic (better DX)
- Can add GraphQL later if needed

**Trade-offs**:
- ✅ Pros: Simple, standard, easy to document, widely supported
- ❌ Cons: More verbose than GraphQL, need versioning strategy

**Implementation**:
- `/api/generate`, `/api/projects`, `/api/voices`, etc.
- OpenAPI/Swagger documentation (future)
- API key authentication for external access (Pro+)
- Rate limiting per user/key

---

### D010: Realtime vs Polling for Generation Status (2025-11-18)

**Context**: Voice generation takes 5-30 seconds, need to update UI

**Options Considered**:
1. Polling (check status every 2 seconds)
2. WebSockets (Supabase Realtime)
3. Server-Sent Events (SSE)
4. Long polling

**Decision**: Polling with exponential backoff (for now), Realtime (future)

**Rationale**:
- Polling is simple, works everywhere, no connection management
- Supabase Realtime adds complexity and may not work behind some proxies
- Generation is async job, not critical to be instant
- Can upgrade to Realtime later for better UX
- Exponential backoff reduces server load

**Trade-offs**:
- ✅ Pros: Simple, reliable, no connection issues
- ❌ Cons: Slightly delayed updates, more requests

**Implementation**:
- Poll every 2s for first 10s, then 5s, then 10s
- Max 30 retries (5 minutes total)
- Show progress indicator
- Upgrade to Realtime in Phase 2

---

### D011: Monorepo vs Single App (2025-11-18)

**Context**: Could split frontend, backend, admin panel, etc.

**Options Considered**:
1. Monorepo (Turborepo, Nx) with multiple apps
2. Single Next.js app with all features
3. Separate repos for frontend/backend

**Decision**: Single Next.js app (modular monolith)

**Rationale**:
- Simpler deployment (one container)
- Easier development (no cross-repo coordination)
- Next.js handles frontend + backend well
- Can extract services later if needed
- No monorepo complexity for single developer

**Trade-offs**:
- ✅ Pros: Simple, fast iteration, easy deployment
- ❌ Cons: Can't scale components independently (but not needed yet)

**Implementation**:
- Clear module boundaries within app
- Separate folders: `/app`, `/components`, `/lib`
- Can extract admin panel to separate app later if needed

---

### D012: Environment Variable Management (2025-11-18)

**Context**: Need to manage secrets securely across local/staging/production

**Options Considered**:
1. .env files (gitignored)
2. Docker secrets
3. Secret management service (Vault, AWS Secrets Manager)
4. Encrypted .env files in git

**Decision**: .env files (gitignored) + .env.example (committed)

**Rationale**:
- Simple, standard for Next.js
- .env.example documents required variables
- Docker can inject .env.production
- No additional infrastructure needed
- Good enough for VPS deployment

**Trade-offs**:
- ✅ Pros: Simple, standard, no extra tools
- ❌ Cons: Manual secret management, no rotation automation

**Implementation**:
- `.env.example` - Template with all variables (no secrets)
- `.env.local` - Local development (gitignored)
- `.env.production` - Production secrets (gitignored, on VPS only)
- Docker Compose loads `.env.production`

---

### D013: Error Tracking (2025-11-18)

**Context**: Need to track and debug production errors

**Options Considered**:
1. Console logs only
2. Sentry (paid service)
3. LogRocket
4. Custom logging to database

**Decision**: Console logs for now, Sentry (optional future enhancement)

**Rationale**:
- Console logs sufficient for MVP (Docker logs)
- Can add Sentry later when needed (has free tier)
- Focus on core features first
- Structured logging with Winston/Pino

**Trade-offs**:
- ✅ Pros: No cost, simple, no external dependency
- ❌ Cons: Harder to track errors, no alerting

**Implementation**:
- Structured logging to stdout (Docker captures)
- Error boundaries in React
- API error responses with correlation IDs
- Can add Sentry in Phase 2

---

### D014: Testing Strategy (2025-11-18)

**Context**: Need to ensure code quality and prevent regressions

**Options Considered**:
1. Unit tests only (Vitest)
2. Unit + Integration tests
3. Unit + Integration + E2E (Playwright)
4. No tests (manual QA)

**Decision**: Unit + Integration tests (Vitest), E2E optional (Playwright)

**Rationale**:
- Unit tests for business logic (credit calc, auth, etc.)
- Integration tests for API routes
- E2E expensive to maintain for solo dev
- Focus on high-value tests (auth, generation, credits)

**Trade-offs**:
- ✅ Pros: Good coverage, fast tests, catches regressions
- ❌ Cons: Requires discipline to maintain, E2E would be ideal

**Implementation**:
- Vitest for unit/integration
- React Testing Library for components
- Test database/fixtures
- Run in CI pipeline
- Coverage target: 70%+ for core logic

---

## Summary

**Total Decisions**: 14
**Architecture**: 6
**Infrastructure**: 4
**Business Logic**: 2
**UI/UX**: 1
**Development**: 1

**Key Themes**:
- Prioritize simplicity and proven technologies
- Use Supabase ecosystem where possible (database, auth, storage)
- Can always upgrade/refactor later (don't over-engineer)
- Follow industry standards and best practices
- Document everything for future maintainability

---

**Last Updated**: 2025-11-18
