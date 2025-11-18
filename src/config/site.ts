export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "SmartCamp.AI Voice Generator",
  description:
    "Create professional AI-powered voiceovers with natural-sounding text-to-speech. Transform your content with realistic voice generation powered by advanced AI.",
  url: "https://voice.smartcamp.ai",
  ogImage: "https://voice.smartcamp.ai/og.jpg",
  links: {
    twitter: "https://twitter.com/smartcampai",
    github: "https://github.com/smartcamp/ai-voice-generator",
    linkedin: "https://linkedin.com/company/smartcamp-ai",
    discord: "https://discord.gg/smartcamp-ai",
  },
  creator: {
    name: "SmartCamp.AI",
    url: "https://smartcamp.ai",
  },
  keywords: [
    "AI voice generator",
    "text-to-speech",
    "TTS",
    "voice synthesis",
    "AI voiceover",
    "natural voice",
    "voice cloning",
    "audio generation",
    "speech synthesis",
    "SmartCamp.AI",
  ],
  mainNav: [
    {
      title: "Features",
      href: "/#features",
    },
    {
      title: "Pricing",
      href: "/pricing",
    },
    {
      title: "Voices",
      href: "/voices",
    },
    {
      title: "Documentation",
      href: "/docs",
    },
    {
      title: "Blog",
      href: "/blog",
    },
  ],
  footerNav: [
    {
      title: "Product",
      items: [
        {
          title: "Features",
          href: "/#features",
        },
        {
          title: "Pricing",
          href: "/pricing",
        },
        {
          title: "Voice Library",
          href: "/voices",
        },
        {
          title: "API",
          href: "/api",
        },
      ],
    },
    {
      title: "Resources",
      items: [
        {
          title: "Documentation",
          href: "/docs",
        },
        {
          title: "Blog",
          href: "/blog",
        },
        {
          title: "Tutorials",
          href: "/tutorials",
        },
        {
          title: "Use Cases",
          href: "/use-cases",
        },
      ],
    },
    {
      title: "Company",
      items: [
        {
          title: "About",
          href: "/about",
        },
        {
          title: "Contact",
          href: "/contact",
        },
        {
          title: "Careers",
          href: "/careers",
        },
        {
          title: "Partners",
          href: "/partners",
        },
      ],
    },
    {
      title: "Legal",
      items: [
        {
          title: "Privacy Policy",
          href: "/privacy",
        },
        {
          title: "Terms of Service",
          href: "/terms",
        },
        {
          title: "Cookie Policy",
          href: "/cookies",
        },
        {
          title: "GDPR",
          href: "/gdpr",
        },
      ],
    },
  ],
  features: {
    enableVoiceCloning: true,
    enableMultiLanguage: true,
    enableCustomVoices: true,
    enableAPIAccess: true,
    enableTeamWorkspaces: true,
    enableAnalytics: true,
    enableWebhooks: false, // Coming soon
    enableSSO: false, // Enterprise only
  },
  limits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxTextLength: 5000, // characters
    maxAudioDuration: 600, // 10 minutes in seconds
    supportedFormats: ["mp3", "wav", "ogg", "flac"],
    supportedLanguages: [
      "en-US",
      "en-GB",
      "es-ES",
      "fr-FR",
      "de-DE",
      "it-IT",
      "pt-BR",
      "ja-JP",
      "ko-KR",
      "zh-CN",
    ],
  },
};
