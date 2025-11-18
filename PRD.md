# AI Voice Generator - Product Requirements Document

## 1. Executive Summary

**Product Name**: AI Voice Generator by SmartCamp.AI
**Version**: 1.0
**Last Updated**: 2025-11-18

### Vision
Create a professional, user-friendly AI-powered voice generation platform that allows users to convert text to speech using advanced AI models, manage voice profiles, and generate high-quality audio content for various use cases.

### Target Users
- Content creators (podcasters, YouTubers, educators)
- Marketing professionals
- Authors and audiobook producers
- Accessibility advocates
- Businesses needing voiceovers

## 2. Core Features

### 2.1 User Authentication & Management
- **User Registration**: Email/password and OAuth (Google, GitHub)
- **User Profiles**: Manage personal information, preferences, and API keys
- **Role-Based Access**: Free tier, Pro tier, Enterprise tier
- **Session Management**: Secure JWT-based authentication via Supabase

### 2.2 Voice Generation Engine
- **Text-to-Speech Conversion**:
  - Support for multiple AI voice models
  - Real-time generation for short texts (<500 chars)
  - Async generation for long-form content
  - Multiple language support (English, Spanish, French, German, Italian, Portuguese, Polish, Dutch)
- **Voice Customization**:
  - Voice selection (male/female, age, accent)
  - Speed control (0.5x - 2.0x)
  - Pitch adjustment
  - Emotional tone (neutral, excited, calm, professional)
- **Output Formats**: MP3, WAV, OGG
- **Quality Settings**: Standard (128kbps), High (256kbps), Premium (320kbps)

### 2.3 Voice Library & Management
- **Voice Profiles**: Pre-built library of 50+ AI voices
- **Custom Voices** (Pro/Enterprise):
  - Voice cloning from audio samples (min 30s of audio)
  - Personal voice library
- **Voice Preview**: 30-second preview before generation
- **Favorites**: Save frequently used voices

### 2.4 Project Management
- **Projects**: Organize generations into projects
- **History**: Track all generated audio files
- **Batch Processing**: Generate multiple texts with same voice settings
- **Templates**: Save common configurations (voice + settings)

### 2.5 Audio Management
- **Storage**: Supabase Storage for audio files
- **Download**: Direct download or shareable links
- **Playback**: In-app audio player with waveform visualization
- **Editing** (Future): Basic audio trimming and concatenation

### 2.6 Integration & API
- **REST API**: For programmatic access
- **Webhooks**: n8n integration for workflow automation
- **Export Options**: Direct export to common platforms
- **Embed Player**: Embeddable audio player for websites

### 2.7 Credits & Billing
- **Credit System**:
  - Free tier: 10,000 characters/month
  - Pro tier: 500,000 characters/month ($19/mo)
  - Enterprise: Unlimited ($99/mo)
- **Pay-as-you-go**: Purchase additional credits
- **Usage Dashboard**: Track credit consumption
- **Invoice Generation**: PDF invoices via Gotenberg

## 3. Technical Architecture

### 3.1 Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with SmartCamp.AI design system
- **Backend**: Next.js API Routes, Supabase Edge Functions
- **Database**: PostgreSQL via Supabase (VPS deployment)
- **Storage**: Supabase Storage (namespaced buckets)
- **Authentication**: Supabase Auth
- **AI/Voice**: Integration with OpenAI TTS, ElevenLabs, or similar
- **Workflow Automation**: n8n (hosted on VPS)
- **PDF Generation**: Gotenberg (for invoices, reports)
- **AI Assistant**: Flowise (for customer support chatbot)

### 3.2 Infrastructure
- **Hosting**: VPS (smartcamp.ai domain)
- **Reverse Proxy**: Traefik
- **Services**:
  - `voice.smartcamp.ai` - Main application
  - `api.supabase.smartcamp.ai` - Supabase API
  - `n8n.smartcamp.ai` - n8n workflows
  - `flowise.smartcamp.ai` - AI chatbot
  - `gotenberg.smartcamp.ai` - PDF service

### 3.3 Database Schema (Namespaced: `voicegen_`)
- **voicegen_users** - User profiles (extends Supabase auth.users)
- **voicegen_projects** - User projects
- **voicegen_generations** - Voice generation history
- **voicegen_voices** - Available voice profiles
- **voicegen_custom_voices** - User's custom voice clones
- **voicegen_credits** - Credit transactions
- **voicegen_subscriptions** - Subscription management
- **voicegen_api_keys** - User API keys
- **voicegen_webhooks** - Webhook configurations

### 3.4 Storage Buckets (Namespaced)
- **voicegen-audio** - Generated audio files
- **voicegen-voice-samples** - Voice cloning samples
- **voicegen-invoices** - Generated PDF invoices

## 4. User Flows

### 4.1 Onboarding Flow
1. User lands on homepage with jungle-themed hero
2. Sign up via email or OAuth
3. Welcome screen with product tour
4. Free credits automatically applied
5. Redirect to dashboard

### 4.2 Voice Generation Flow
1. User navigates to "Generate" page
2. Enter/paste text (character count displayed)
3. Select voice from library (with preview)
4. Adjust settings (speed, pitch, tone)
5. Preview cost in credits
6. Click "Generate"
7. Progress indicator (for async jobs)
8. Audio player appears with download/share options
9. Generation saved to history

### 4.3 Project Management Flow
1. User creates new project
2. Add generations to project
3. Batch generate with same settings
4. Export project as ZIP
5. Share project with team (Enterprise)

## 5. UI/UX Requirements

### 5.1 Branding
- **Design System**: SmartCamp.AI branding
- **Theme**: Jungle background with glassmorphism overlays
- **Typography**: Jost font family
- **Colors**: Green/teal primary, warm accents
- **Mascot**: Friendly jungle animals (optional illustrations)

### 5.2 Key Pages
1. **Homepage**: Hero, features, pricing, testimonials, footer
2. **Dashboard**: Usage stats, recent generations, quick actions
3. **Generate**: Main voice generation interface
4. **Library**: Browse/search voice profiles
5. **Projects**: Project management interface
6. **History**: List of all generations with filters
7. **Settings**: Profile, API keys, billing, preferences
8. **Pricing**: Tier comparison and upgrade options
9. **Documentation**: API docs, guides, tutorials

### 5.3 Responsive Design
- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly controls
- Accessible (WCAG 2.1 AA)

## 6. Integration Requirements

### 6.1 n8n Workflows
- **New User Webhook**: Send welcome email
- **Generation Complete**: Notify user, update credits
- **Subscription Change**: Handle upgrades/downgrades
- **Invoice Generation**: Trigger Gotenberg PDF creation
- **Usage Alerts**: Notify users at 80%, 90%, 100% credit usage

### 6.2 Flowise Chatbot
- **Support Assistant**: Embedded chat widget
- **Knowledge Base**: FAQ, documentation, troubleshooting
- **Contextual Help**: Page-specific assistance

### 6.3 External APIs
- **Voice AI Provider**: OpenAI TTS / ElevenLabs / Azure Speech
- **Payment**: Stripe for subscriptions and credits
- **Email**: SendGrid / Resend for transactional emails
- **Analytics**: Plausible / PostHog (privacy-focused)

## 7. Security & Privacy

### 7.1 Security Measures
- **Authentication**: Supabase Auth with RLS
- **API Security**: Rate limiting, API key validation
- **Data Encryption**: At rest and in transit (TLS)
- **Input Validation**: Sanitize all user inputs
- **CSRF Protection**: Built-in Next.js protection
- **XSS Prevention**: Content Security Policy headers

### 7.2 Privacy
- **GDPR Compliance**: Data deletion, export, consent
- **Data Retention**: 90 days for free tier, 1 year for paid
- **Privacy Policy**: Clear data usage policy
- **Cookie Consent**: EU cookie compliance
- **Anonymization**: Option to anonymize voice generations

## 8. Performance Requirements

- **Time to Interactive**: < 2s on 4G connection
- **Voice Generation**: < 5s for 500 chars (real-time), < 30s for 5000 chars
- **API Response Time**: < 200ms (excluding AI processing)
- **Uptime**: 99.5% SLA
- **Concurrent Users**: Support 1000+ simultaneous users

## 9. Success Metrics

### 9.1 Business Metrics
- User signups (target: 1000/month)
- Conversion to paid: 5%
- Monthly Recurring Revenue (MRR): $10k by month 6
- Churn rate: < 5%

### 9.2 Technical Metrics
- Average generation time
- Error rate: < 0.5%
- API uptime: > 99.5%
- Credit system accuracy: 100%

### 9.3 User Metrics
- Daily Active Users (DAU)
- Generations per user
- Voice library usage
- Customer satisfaction: > 4.5/5

## 10. Roadmap

### Phase 1 - MVP (Current)
- Core voice generation
- User authentication
- Basic voice library
- Credit system
- Essential integrations

### Phase 2 - Enhancement (Month 2-3)
- Custom voice cloning
- Advanced audio editing
- Team collaboration
- API v2
- Mobile apps (React Native)

### Phase 3 - Scale (Month 4-6)
- Voice marketplace
- Multi-language expansion
- Advanced analytics
- Enterprise features
- White-label offering

## 11. Constraints & Assumptions

### Constraints
- Budget: Bootstrap/self-funded initially
- Team: Solo developer (Claude-assisted)
- Timeline: MVP in 1 sprint
- Infrastructure: Shared VPS resources

### Assumptions
- Users have modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Average text length: 500-2000 characters
- English is primary language (initially)
- Users are comfortable with credit-based pricing
- Voice AI APIs remain accessible and affordable

## 12. Glossary

- **Generation**: A single text-to-speech conversion job
- **Credit**: Unit of consumption (1 credit = 1 character)
- **Voice Profile**: A specific AI voice configuration
- **Voice Clone**: Custom voice created from user samples
- **Project**: Collection of related generations
- **Template**: Saved voice generation configuration

## 13. Appendix

### A. Competitive Analysis
- **ElevenLabs**: High quality but expensive
- **Play.ht**: Good features, complex UI
- **Murf.ai**: Professional but limited free tier
- **Differentiation**: SmartCamp.AI - Affordable, beautiful UI, simple workflows

### B. References
- SmartCamp.AI Branding Guide
- VPS Configuration Documentation
- Supabase Documentation
- Next.js Best Practices
