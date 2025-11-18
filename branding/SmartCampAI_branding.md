# SmartCamp.AI - Brand Identity & Design System

## 1. Brand Overview

**Brand Name**: SmartCamp.AI
**Tagline**: "AI-Powered Innovation in the Digital Jungle"
**Brand Personality**: Innovative, Approachable, Natural, Intelligent, Trustworthy

**Core Values**:
- Innovation: Cutting-edge AI technology
- Accessibility: Easy to use for everyone
- Nature-Tech Harmony: Blending organic jungle themes with modern technology
- Transparency: Clear, honest communication
- Quality: Premium user experience

## 2. Visual Identity

### 2.1 Logo
- **Primary Logo**: SmartCamp.AI wordmark with jungle leaf accent
- **Icon**: Stylized "SC" monogram with leaf element
- **Mascot** (Optional): Friendly jungle animals (monkey, parrot, sloth) as illustrations

**Logo Usage**:
- Minimum size: 120px width (digital), 1 inch (print)
- Clear space: 0.5x the height of logo on all sides
- Do not distort, rotate, or modify colors
- Available formats: SVG (preferred), PNG (transparent background)

### 2.2 Color Palette

**Primary Colors**:
```css
--brand-primary-900: #0D3B2F;      /* Deep Forest */
--brand-primary-800: #115940;      /* Dark Jungle */
--brand-primary-700: #167850;      /* Forest Green */
--brand-primary-600: #1A9661;      /* Emerald */
--brand-primary-500: #1EB571;      /* Primary Green */
--brand-primary-400: #4BC58D;      /* Light Green */
--brand-primary-300: #78D5AA;      /* Mint */
--brand-primary-200: #A5E5C7;      /* Pale Mint */
--brand-primary-100: #D2F5E4;      /* Whisper Green */
```

**Secondary Colors (Teal/Cyan)**:
```css
--brand-secondary-900: #0C4A6E;    /* Deep Ocean */
--brand-secondary-800: #075985;    /* Ocean Blue */
--brand-secondary-700: #0369A1;    /* Teal */
--brand-secondary-600: #0284C7;    /* Bright Teal */
--brand-secondary-500: #0EA5E9;    /* Sky Blue */
--brand-secondary-400: #38BDF8;    /* Light Sky */
--brand-secondary-300: #7DD3FC;    /* Pale Sky */
--brand-secondary-200: #BAE6FD;    /* Ice Blue */
--brand-secondary-100: #E0F2FE;    /* Whisper Blue */
```

**Accent Colors**:
```css
--brand-accent-warm: #F59E0B;      /* Amber - for CTAs, highlights */
--brand-accent-hot: #EF4444;       /* Red - for errors, urgent alerts */
--brand-accent-cool: #8B5CF6;      /* Purple - for premium features */
--brand-accent-success: #10B981;   /* Green - for success states */
```

**Neutral Colors**:
```css
--neutral-900: #171717;            /* Almost Black */
--neutral-800: #262626;            /* Dark Gray */
--neutral-700: #404040;            /* Charcoal */
--neutral-600: #525252;            /* Gray */
--neutral-500: #737373;            /* Medium Gray */
--neutral-400: #A3A3A3;            /* Light Gray */
--neutral-300: #D4D4D4;            /* Silver */
--neutral-200: #E5E5E5;            /* Pale Gray */
--neutral-100: #F5F5F5;            /* Off White */
--neutral-50: #FAFAFA;             /* Almost White */
```

### 2.3 Typography

**Primary Font**: Jost (Google Fonts)
- **Weights Available**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold)
- **Use Cases**:
  - Headers: Jost 600-700
  - Body text: Jost 400
  - UI elements: Jost 500
  - Captions: Jost 300-400

**Font Hierarchy**:
```css
/* Display */
--font-size-display: 4.5rem;       /* 72px */
--line-height-display: 1.1;
--font-weight-display: 700;

/* H1 */
--font-size-h1: 3rem;              /* 48px */
--line-height-h1: 1.2;
--font-weight-h1: 700;

/* H2 */
--font-size-h2: 2.25rem;           /* 36px */
--line-height-h2: 1.3;
--font-weight-h2: 600;

/* H3 */
--font-size-h3: 1.875rem;          /* 30px */
--line-height-h3: 1.3;
--font-weight-h3: 600;

/* H4 */
--font-size-h4: 1.5rem;            /* 24px */
--line-height-h4: 1.4;
--font-weight-h4: 600;

/* H5 */
--font-size-h5: 1.25rem;           /* 20px */
--line-height-h5: 1.5;
--font-weight-h5: 500;

/* H6 */
--font-size-h6: 1rem;              /* 16px */
--line-height-h6: 1.5;
--font-weight-h6: 500;

/* Body Large */
--font-size-body-lg: 1.125rem;     /* 18px */
--line-height-body-lg: 1.7;
--font-weight-body-lg: 400;

/* Body */
--font-size-body: 1rem;            /* 16px */
--line-height-body: 1.7;
--font-weight-body: 400;

/* Body Small */
--font-size-body-sm: 0.875rem;     /* 14px */
--line-height-body-sm: 1.6;
--font-weight-body-sm: 400;

/* Caption */
--font-size-caption: 0.75rem;      /* 12px */
--line-height-caption: 1.5;
--font-weight-caption: 400;
```

**Monospace Font** (for code):
- **Font**: 'Fira Code', 'Monaco', 'Courier New', monospace

### 2.4 Spacing System

Based on 4px base unit:
```css
--space-0: 0;
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
--space-24: 6rem;      /* 96px */
--space-32: 8rem;      /* 128px */
```

### 2.5 Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem;      /* 4px */
--radius-md: 0.5rem;       /* 8px - default */
--radius-lg: 0.75rem;      /* 12px */
--radius-xl: 1rem;         /* 16px */
--radius-2xl: 1.5rem;      /* 24px */
--radius-full: 9999px;     /* Full circle */
```

### 2.6 Shadows

```css
/* Elevation shadows */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Glassmorphism shadow */
--shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.15);

/* Inner shadows */
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
```

## 3. Design Patterns

### 3.1 Glassmorphism

**Primary Design Pattern**: Frosted glass effect over jungle background

**Standard Glass Card**:
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}
```

**Dark Glass Variant**:
```css
.glass-card-dark {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

**Intense Glass (Modals, Overlays)**:
```css
.glass-intense {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

### 3.2 Jungle Background

**Primary Background**: Lush jungle scene with depth
- **File**: `jungle-background.png` or `jungle-background.jpg`
- **Characteristics**:
  - Rich green foliage
  - Subtle depth with foreground and background layers
  - Natural lighting (dappled sunlight through canopy)
  - Not too busy - allows content to be readable
  - Can be slightly blurred for better text contrast

**Background Overlay**:
```css
.jungle-bg {
  background-image: url('/public/jungle-background.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}

.jungle-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(13, 59, 47, 0.7) 0%,
    rgba(30, 181, 113, 0.5) 100%
  );
}
```

### 3.3 Component Patterns

**Buttons**:
```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(135deg, var(--brand-primary-600), var(--brand-primary-500));
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Secondary Button */
.btn-secondary {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

/* Accent Button (CTA) */
.btn-accent {
  background: linear-gradient(135deg, #F59E0B, #F97316);
  color: white;
}
```

**Input Fields**:
```css
.input-field {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  color: var(--neutral-900);
  transition: all 0.3s ease;
}

.input-field:focus {
  background: rgba(255, 255, 255, 0.2);
  border-color: var(--brand-primary-500);
  outline: none;
  box-shadow: 0 0 0 3px rgba(30, 181, 113, 0.1);
}
```

**Cards**:
```css
.card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-glass);
}
```

### 3.4 Animation

**Transition Timings**:
```css
--transition-fast: 150ms;
--transition-base: 300ms;
--transition-slow: 500ms;

--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

**Common Animations**:
- **Hover**: Slight lift (translateY -2px) + shadow increase
- **Click**: Scale down (0.98) briefly
- **Page Transitions**: Fade in + slide up
- **Loading**: Pulse or shimmer effect

## 4. UI Components Library

### 4.1 Navigation
- **Navbar**: Glassmorphism bar with logo, main nav, user menu
- **Sidebar**: Optional collapsible sidebar for dashboards
- **Breadcrumbs**: For nested navigation
- **Tabs**: For content sections

### 4.2 Data Display
- **Tables**: Responsive with hover states
- **Cards**: Info cards, stat cards, feature cards
- **Lists**: Ordered, unordered, with icons
- **Avatars**: User profile images with fallback
- **Badges**: Status indicators, labels
- **Progress Bars**: Linear and circular

### 4.3 Feedback
- **Alerts**: Success, error, warning, info (with icons)
- **Toasts**: Temporary notifications
- **Modals**: Overlay dialogs
- **Loading Spinners**: Branded spinner
- **Skeletons**: Content placeholders

### 4.4 Form Elements
- **Text Input**: Single line
- **Textarea**: Multi-line
- **Select**: Dropdown menus
- **Checkbox**: Single and grouped
- **Radio**: Single choice
- **Toggle**: On/off switch
- **File Upload**: Drag-and-drop area
- **Slider**: Range inputs

## 5. Logo & Asset Files

**Required Files** (to be created):
- `SmartCampAI.svg` - Primary logo (vector)
- `SmartCampAI.png` - Primary logo (raster, transparent)
- `SmartCampAI-icon.svg` - Icon only
- `SmartCampAI-icon.png` - Icon only (for favicons)
- `jungle-background.jpg` - Main background image
- `jungle-background-blur.jpg` - Blurred variant
- `favicon.ico` - 16x16, 32x32, 48x48
- `apple-touch-icon.png` - 180x180
- `og-image.png` - 1200x630 (for social sharing)

**Optional Mascot Assets**:
- `mascot-monkey.svg` - Friendly jungle monkey
- `mascot-parrot.svg` - Colorful parrot
- `mascot-sloth.svg` - Chill sloth

## 6. Brand Voice & Messaging

**Tone**:
- Friendly but professional
- Clear and concise
- Encouraging and supportive
- Technically confident but not jargon-heavy

**Writing Guidelines**:
- Use active voice
- Short sentences and paragraphs
- Avoid technical jargon unless necessary
- Include helpful examples
- Be encouraging ("Let's create", "You can", "It's easy")

**Example Microcopy**:
- Button: "Start Creating" (not "Submit")
- Error: "Oops! Something went wrong" (not "Error 500")
- Success: "Your voice is ready!" (not "Generation complete")
- Empty State: "No projects yet. Let's create your first one!"

## 7. Accessibility

**WCAG 2.1 AA Compliance**:
- Color contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Keyboard navigation support
- Screen reader friendly (semantic HTML, ARIA labels)
- Focus indicators clearly visible
- Alt text for all images
- Captions for audio/video

**Color Contrast Tested Combinations**:
- White text on primary-600: ✓ Pass
- White text on secondary-600: ✓ Pass
- Dark text (neutral-900) on neutral-100: ✓ Pass
- Dark text on white glass cards: ✓ Pass (with proper background)

## 8. Footer Requirement

**Mandatory Footer**:
Every page must include:
```html
<footer>
  © Created with ❤️ by <a href="https://smartcamp.ai/">SmartCamp.AI</a>
</footer>
```

**Style**:
- Centered or left-aligned
- Subtle color (neutral-400)
- Link color: primary-500 with hover effect
- Small font size (14px)

## 9. Responsive Breakpoints

```css
/* Mobile First */
--breakpoint-sm: 640px;    /* Small devices */
--breakpoint-md: 768px;    /* Tablets */
--breakpoint-lg: 1024px;   /* Laptops */
--breakpoint-xl: 1280px;   /* Desktops */
--breakpoint-2xl: 1536px;  /* Large screens */
```

## 10. Brand Assets Usage Guidelines

**Do's**:
- Use official logo files
- Maintain proper spacing and proportions
- Apply glassmorphism consistently
- Use Jost font throughout
- Keep jungle theme cohesive
- Ensure readability over backgrounds

**Don'ts**:
- Don't distort or skew the logo
- Don't use non-brand colors for primary elements
- Don't place text directly on busy backgrounds without glass effect
- Don't mix multiple design styles
- Don't use competing fonts
- Don't remove or hide the footer attribution

## 11. Implementation Notes

This design system should be implemented using:
- **CSS Variables** for all tokens (colors, spacing, typography)
- **Tailwind CSS** configuration extending base theme
- **Component Library** (shadcn/ui or custom) following these patterns
- **Dark Mode Support** (optional, future enhancement)

All components should be:
- Reusable and composable
- Fully typed (TypeScript)
- Documented with Storybook (optional but recommended)
- Tested for accessibility
- Responsive by default
