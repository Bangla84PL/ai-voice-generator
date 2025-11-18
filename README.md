# AI Voice Generator by SmartCamp.AI

> Convert text to speech with AI-powered voices. Professional, beautiful, and easy to use.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

![AI Voice Generator](public/images/og-image.jpg)

## 🌟 Features

- **🎙️ High-Quality AI Voices** - 50+ professional AI voices powered by OpenAI and ElevenLabs
- **🌍 Multi-Language Support** - Generate speech in 8+ languages
- **⚡ Real-time Generation** - Fast text-to-speech conversion (<5s for short texts)
- **🎨 Beautiful UI** - Jungle-themed interface with glassmorphism effects
- **📊 Project Management** - Organize your voice generations into projects
- **💳 Flexible Pricing** - Free tier with generous limits, affordable Pro and Enterprise plans
- **🔑 API Access** - RESTful API for programmatic voice generation (Pro+)
- **🎛️ Voice Customization** - Adjust speed, pitch, and emotional tone
- **🔐 Secure & Private** - Your data is encrypted and never used for training

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm 10+
- Supabase account (or self-hosted Supabase)
- OpenAI API key
- (Optional) ElevenLabs API key, Stripe account, Resend account

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/ai-voice-generator.git
cd ai-voice-generator

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
nano .env.local
```

### Required Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Provider (at least one required)
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See `.env.example` for all available variables.

### Database Setup

```bash
# Run Supabase migrations
npm run db:migrate

# Seed voice library
npm run db:seed
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🏗️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/)
- **Authentication**: [Supabase Auth](https://supabase.com/auth)
- **Storage**: [Supabase Storage](https://supabase.com/storage)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **AI Voice**: [OpenAI TTS](https://platform.openai.com/docs/guides/text-to-speech) / [ElevenLabs](https://elevenlabs.io/)
- **Payments**: [Stripe](https://stripe.com/)
- **Email**: [Resend](https://resend.com/)
- **Workflow Automation**: [n8n](https://n8n.io/)
- **PDF Generation**: [Gotenberg](https://gotenberg.dev/)
- **Deployment**: Docker + Traefik

## 📁 Project Structure

```
ai-voice-generator/
├── .github/              # GitHub Actions CI/CD
├── docs/                 # Documentation
├── n8n/                  # n8n workflow definitions
├── public/               # Static assets
├── scripts/              # Utility scripts
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── (auth)/       # Auth pages (login, signup)
│   │   ├── (dashboard)/  # Dashboard pages (generate, history, etc.)
│   │   ├── api/          # API routes
│   │   └── page.tsx      # Homepage
│   ├── components/       # React components
│   │   ├── ui/           # Base UI components
│   │   ├── layout/       # Layout components
│   │   ├── voice/        # Voice-specific components
│   │   └── project/      # Project components
│   ├── lib/              # Core libraries
│   │   ├── supabase/     # Supabase client utilities
│   │   ├── ai/           # AI provider integrations
│   │   ├── stripe/       # Stripe integration
│   │   ├── email/        # Email service
│   │   └── n8n/          # n8n webhooks
│   ├── hooks/            # React hooks
│   ├── types/            # TypeScript types
│   ├── config/           # Configuration files
│   └── styles/           # Global styles
├── supabase/             # Database schema and migrations
├── Dockerfile            # Docker image configuration
├── docker-compose.yml    # Docker Compose setup
└── package.json
```

## 📖 Documentation

- **[PRD](PRD.md)** - Product Requirements Document
- **[Architecture](docs/ARCHITECTURE.md)** - Technical architecture and design
- **[API Documentation](API.md)** - API endpoints and usage
- **[Deployment Guide](DEPLOYMENT.md)** - Deployment instructions
- **[Branding Guide](branding/SmartCampAI_branding.md)** - Design system and branding
- **[VPS Configuration](VPS_CONFIGURATION_GUIDE.md)** - VPS setup guide
- **[Claude Manifest](CLAUDE_MANIFEST.md)** - Orientation for future development
- **[Progress](PROGRESS.md)** - Implementation progress log
- **[Decisions](DECISIONS.md)** - Technical decision log

## 🎯 User Flows

### Generate Voice

1. Navigate to **Generate** page
2. Enter or paste text (up to 10,000 characters)
3. Select voice from library (preview available)
4. Adjust settings (speed, pitch, format, quality)
5. Review credit cost
6. Click **Generate**
7. Download or playback generated audio

### Manage Projects

1. Create new project from **Projects** page
2. Add generations to project
3. Batch generate with same settings
4. Export project as ZIP
5. Share with team (Enterprise)

### API Usage (Pro+)

```bash
# Generate API key from Settings
# Then use the API

curl -X POST https://voice.smartcamp.ai/api/generate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world",
    "voiceId": "voice-uuid",
    "format": "mp3"
  }'
```

## 💰 Pricing

| Plan | Price | Credits/Month | Features |
|------|-------|---------------|----------|
| **Free** | $0 | 10,000 chars | Basic voices, standard quality |
| **Pro** | $19/mo | 500,000 chars | All voices, custom voices, API access, high quality |
| **Enterprise** | $99/mo | Unlimited | Everything + priority support, team features |

1 credit = 1 character. Additional credit packs available for purchase.

## 🔒 Security

- **HTTPS Only** - All traffic encrypted with SSL/TLS
- **Row Level Security** - Database-level access control
- **API Key Authentication** - Secure programmatic access
- **Rate Limiting** - Protection against abuse
- **Input Validation** - All inputs sanitized
- **GDPR Compliant** - Data export and deletion on request

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🐳 Docker Deployment

### Build

```bash
docker build -t ai-voice-generator .
```

### Run with Docker Compose

```bash
# Copy environment file
cp .env.example .env.production

# Edit .env.production with production values
nano .env.production

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Deploy to VPS

See [DEPLOYMENT.md](DEPLOYMENT.md) and [VPS_CONFIGURATION_GUIDE.md](VPS_CONFIGURATION_GUIDE.md) for complete deployment instructions.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- All tests pass
- Code is properly formatted (`npm run format`)
- TypeScript compiles without errors
- Documentation is updated

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **SmartCamp.AI** - Branding and design system
- **OpenAI** - Text-to-speech AI models
- **Supabase** - Backend infrastructure
- **Vercel** - Next.js framework
- **Radix UI** - Accessible UI primitives

## 🔗 Links

- **Production**: [https://voice.smartcamp.ai](https://voice.smartcamp.ai)
- **Documentation**: [https://docs.smartcamp.ai/voice](https://docs.smartcamp.ai/voice)
- **Support**: [support@smartcamp.ai](mailto:support@smartcamp.ai)
- **Twitter**: [@SmartCampAI](https://twitter.com/SmartCampAI)
- **Discord**: [Join our community](https://discord.gg/smartcamp)

## 📧 Contact

- **Website**: [https://smartcamp.ai](https://smartcamp.ai)
- **Email**: [hello@smartcamp.ai](mailto:hello@smartcamp.ai)
- **GitHub**: [github.com/SmartCampAI](https://github.com/SmartCampAI)

---

<div align="center">
  <strong>© Created with ❤️ by <a href="https://smartcamp.ai/">SmartCamp.AI</a></strong>
</div>
