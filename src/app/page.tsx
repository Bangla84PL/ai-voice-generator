import Link from 'next/link';
import {
  Mic,
  Sparkles,
  Globe,
  Zap,
  Shield,
  Download,
  ArrowRight,
  Check,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass-card sticky top-0 z-50 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-primary-600 to-primary-500">
                <span className="text-xl font-bold text-white">SC</span>
              </div>
              <span className="text-lg font-bold text-white">
                SmartCamp<span className="text-primary-400">.AI</span>
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center space-x-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-accent-warm" />
              <span className="text-sm font-medium text-white">
                AI-Powered Voice Generation
              </span>
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Transform Text into
              <span className="block bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Natural Speech
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-white/90">
              Create professional voiceovers, audiobooks, and podcasts with our
              AI voice generator. Choose from hundreds of voices in multiple
              languages.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/signup">
                <Button variant="primary" size="xl" className="w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button variant="secondary" size="xl" className="w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/70">
              No credit card required • 10,000 free credits
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Powerful Features
            </h2>
            <p className="text-lg text-white/80">
              Everything you need to create professional voice content
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-card group p-6 transition-all duration-300 hover:scale-105 hover:shadow-glass-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-primary-600/30 to-primary-500/30">
                  <feature.icon className="h-6 w-6 text-primary-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-white/80">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="text-lg text-white/80">
              Generate professional voice content in three simple steps
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                <div className="glass-intense p-8 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-2xl font-bold text-white">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="text-white/80">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 md:block">
                    <ArrowRight className="h-6 w-6 text-primary-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-white/80">
              Choose the plan that fits your needs
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`glass-card relative overflow-hidden p-8 ${
                  plan.popular ? 'ring-2 ring-primary-400' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute right-0 top-0 bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-1 text-xs font-semibold text-white">
                    POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="mb-2 text-2xl font-bold text-white">
                    {plan.name}
                  </h3>
                  <div className="mb-2 flex items-baseline">
                    <span className="text-4xl font-bold text-white">
                      ${plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="ml-2 text-white/70">/month</span>
                    )}
                  </div>
                  <p className="text-white/80">{plan.description}</p>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 text-primary-400" />
                      <span className="text-white/90">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup">
                  <Button
                    variant={plan.popular ? 'primary' : 'secondary'}
                    className="w-full"
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Loved by Creators
            </h2>
            <p className="text-lg text-white/80">
              See what our users have to say
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author} className="glass-card p-6">
                <div className="mb-4 flex text-accent-warm">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="mb-4 text-white/90">{testimonial.content}</p>
                <div className="flex items-center">
                  <div className="mr-3 h-10 w-10 rounded-full bg-gradient-to-r from-primary-600 to-primary-500" />
                  <div>
                    <div className="font-semibold text-white">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-white/70">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="glass-intense overflow-hidden rounded-2xl p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mb-8 text-xl text-white/90">
              Join thousands of creators using SmartCamp.AI to bring their
              content to life
            </p>
            <Link href="/auth/signup">
              <Button variant="primary" size="xl">
                Start Creating Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link href="/" className="mb-4 flex items-center space-x-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-primary-600 to-primary-500">
                  <span className="text-xl font-bold text-white">SC</span>
                </div>
                <span className="text-lg font-bold text-white">
                  SmartCamp<span className="text-primary-400">.AI</span>
                </span>
              </Link>
              <p className="mb-4 text-white/70">
                Transform text into natural-sounding speech with AI-powered
                voices.
              </p>
              <p className="text-sm text-white/50">
                © 2024 SmartCamp.AI. All rights reserved.
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-white">Product</h3>
              <ul className="space-y-2 text-white/70">
                <li>
                  <Link href="/features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/voices" className="hover:text-white">
                    Voices
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-white">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold text-white">Company</h3>
              <ul className="space-y-2 text-white/70">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: 'Natural-Sounding Voices',
    description:
      'Access hundreds of AI voices that sound incredibly human and natural.',
    icon: Mic,
  },
  {
    title: 'Multi-Language Support',
    description:
      'Generate speech in over 50 languages with native pronunciation.',
    icon: Globe,
  },
  {
    title: 'Lightning Fast',
    description:
      'Generate high-quality audio in seconds, not hours. Perfect for tight deadlines.',
    icon: Zap,
  },
  {
    title: 'Advanced Customization',
    description:
      'Fine-tune pitch, speed, emphasis, and pauses for perfect delivery.',
    icon: Sparkles,
  },
  {
    title: 'Enterprise Security',
    description:
      'Bank-level encryption and SOC 2 compliance keep your data safe.',
    icon: Shield,
  },
  {
    title: 'Multiple Formats',
    description:
      'Download in MP3, WAV, or other formats compatible with any platform.',
    icon: Download,
  },
];

const steps = [
  {
    title: 'Enter Your Text',
    description:
      'Type or paste your script. Our AI supports texts of any length.',
  },
  {
    title: 'Choose a Voice',
    description:
      'Select from hundreds of voices in different languages and styles.',
  },
  {
    title: 'Generate & Download',
    description:
      'Create your audio in seconds and download in your preferred format.',
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: 0,
    description: 'Perfect for trying out the platform',
    features: [
      '10,000 characters/month',
      '10 voice options',
      'Standard voices',
      'MP3 downloads',
      'Community support',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: 29,
    description: 'Best for content creators',
    features: [
      '500,000 characters/month',
      '100+ voice options',
      'Premium voices',
      'All formats (MP3, WAV, OGG)',
      'Priority support',
      'Commercial license',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 99,
    description: 'For teams and businesses',
    features: [
      'Unlimited characters',
      'All voices & languages',
      'Custom voice cloning',
      'API access',
      'Dedicated support',
      'SLA guarantee',
      'Team collaboration',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const testimonials = [
  {
    author: 'Sarah Johnson',
    role: 'Podcast Producer',
    content:
      "SmartCamp.AI has transformed our podcast production. The voices are so natural, our listeners can't tell the difference!",
  },
  {
    author: 'Michael Chen',
    role: 'Audiobook Narrator',
    content:
      "I've narrated over 50 audiobooks with this platform. The quality is outstanding and it saves me countless hours.",
  },
  {
    author: 'Emily Rodriguez',
    role: 'Content Marketer',
    content:
      'The multi-language support is a game-changer. We can now create content for our global audience effortlessly.',
  },
];
