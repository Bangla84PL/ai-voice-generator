export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  stripePriceIds?: {
    monthly: string;
    yearly: string;
  };
  credits: {
    monthly: number;
    rollover: boolean;
  };
  features: {
    name: string;
    included: boolean;
    limit?: string | number;
  }[];
  popular?: boolean;
  cta: string;
  ctaHref: string;
}

export const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for trying out AI voice generation",
    price: {
      monthly: 0,
      yearly: 0,
    },
    credits: {
      monthly: 1000,
      rollover: false,
    },
    features: [
      {
        name: "1,000 characters per month",
        included: true,
      },
      {
        name: "Standard voices",
        included: true,
        limit: 10,
      },
      {
        name: "MP3 & WAV export",
        included: true,
      },
      {
        name: "Commercial usage",
        included: false,
      },
      {
        name: "Voice cloning",
        included: false,
      },
      {
        name: "Custom voices",
        included: false,
      },
      {
        name: "API access",
        included: false,
      },
      {
        name: "Priority support",
        included: false,
      },
      {
        name: "Team workspaces",
        included: false,
      },
    ],
    cta: "Get Started",
    ctaHref: "/signup",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For professionals and content creators",
    price: {
      monthly: 29,
      yearly: 290, // ~$24/month
    },
    stripePriceIds: {
      monthly: "price_pro_monthly_placeholder",
      yearly: "price_pro_yearly_placeholder",
    },
    credits: {
      monthly: 50000,
      rollover: true,
    },
    features: [
      {
        name: "50,000 characters per month",
        included: true,
      },
      {
        name: "Premium voices",
        included: true,
        limit: 100,
      },
      {
        name: "All audio formats",
        included: true,
      },
      {
        name: "Commercial usage",
        included: true,
      },
      {
        name: "Voice cloning",
        included: true,
        limit: 3,
      },
      {
        name: "Custom voices",
        included: true,
        limit: 5,
      },
      {
        name: "API access",
        included: true,
        limit: "10k requests/month",
      },
      {
        name: "Priority support",
        included: true,
      },
      {
        name: "Team workspaces",
        included: false,
      },
    ],
    popular: true,
    cta: "Start Pro Trial",
    ctaHref: "/signup?plan=pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For teams and organizations at scale",
    price: {
      monthly: 299,
      yearly: 2990, // ~$249/month
    },
    stripePriceIds: {
      monthly: "price_enterprise_monthly_placeholder",
      yearly: "price_enterprise_yearly_placeholder",
    },
    credits: {
      monthly: 500000,
      rollover: true,
    },
    features: [
      {
        name: "500,000 characters per month",
        included: true,
      },
      {
        name: "All premium voices",
        included: true,
        limit: "Unlimited",
      },
      {
        name: "All audio formats",
        included: true,
      },
      {
        name: "Commercial usage",
        included: true,
      },
      {
        name: "Voice cloning",
        included: true,
        limit: "Unlimited",
      },
      {
        name: "Custom voices",
        included: true,
        limit: "Unlimited",
      },
      {
        name: "API access",
        included: true,
        limit: "Unlimited",
      },
      {
        name: "Priority support",
        included: true,
      },
      {
        name: "Team workspaces",
        included: true,
        limit: "Up to 50 users",
      },
      {
        name: "SSO & Advanced security",
        included: true,
      },
      {
        name: "Custom integrations",
        included: true,
      },
      {
        name: "Dedicated account manager",
        included: true,
      },
    ],
    cta: "Contact Sales",
    ctaHref: "/contact-sales",
  },
];

export const creditPackages = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 10000,
    price: 9,
    stripePriceId: "price_credits_10k_placeholder",
    savings: 0,
  },
  {
    id: "growth",
    name: "Growth Pack",
    credits: 50000,
    price: 39,
    stripePriceId: "price_credits_50k_placeholder",
    savings: 10,
  },
  {
    id: "scale",
    name: "Scale Pack",
    credits: 150000,
    price: 99,
    stripePriceId: "price_credits_150k_placeholder",
    savings: 20,
  },
  {
    id: "mega",
    name: "Mega Pack",
    credits: 500000,
    price: 299,
    stripePriceId: "price_credits_500k_placeholder",
    savings: 30,
  },
];

export const featureComparison = {
  characters: {
    name: "Monthly Characters",
    free: "1,000",
    pro: "50,000",
    enterprise: "500,000",
  },
  voices: {
    name: "Voice Library",
    free: "10 standard voices",
    pro: "100+ premium voices",
    enterprise: "All voices (unlimited)",
  },
  formats: {
    name: "Audio Formats",
    free: "MP3, WAV",
    pro: "MP3, WAV, OGG, FLAC",
    enterprise: "All formats + custom",
  },
  commercial: {
    name: "Commercial License",
    free: false,
    pro: true,
    enterprise: true,
  },
  cloning: {
    name: "Voice Cloning",
    free: false,
    pro: "3 voices",
    enterprise: "Unlimited",
  },
  api: {
    name: "API Access",
    free: false,
    pro: "10k requests/month",
    enterprise: "Unlimited",
  },
  support: {
    name: "Support",
    free: "Community",
    pro: "Priority email",
    enterprise: "24/7 dedicated",
  },
  sla: {
    name: "SLA",
    free: false,
    pro: false,
    enterprise: "99.9% uptime",
  },
};
