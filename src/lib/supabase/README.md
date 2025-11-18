# Supabase Client Utilities

Comprehensive Supabase client utilities for the AI Voice Generator Next.js application, following Next.js 14 App Router patterns and Supabase SSR best practices.

## Overview

This directory contains all Supabase client configurations and utilities:

- **`client.ts`** - Browser client for Client Components
- **`server.ts`** - Server client for Server Components and Server Actions
- **`admin.ts`** - Service role client for admin operations (bypasses RLS)
- **`middleware.ts`** - Next.js middleware for authentication and session management
- **`index.ts`** - Centralized exports

## Quick Start

### 1. Environment Variables

Ensure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Browser Client (Client Components)

Use in Client Components for browser-side operations:

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'

export function VoiceSelector() {
  const supabase = createClient()

  const fetchVoices = async () => {
    const { data: voices } = await supabase
      .from('voicegen_voices')
      .select('*')
      .eq('is_active', true)

    return voices
  }

  return <div>...</div>
}
```

### 3. Server Client (Server Components)

Use in Server Components and Server Actions:

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: projects } = await supabase
    .from('voicegen_projects')
    .select('*')

  return <div>{projects?.map(p => p.name)}</div>
}
```

### 4. Admin Client (Admin Operations)

Use for operations that need to bypass RLS (credits, user management):

```tsx
import { createAdminClient, updateUserCredits } from '@/lib/supabase/admin'

export async function grantWelcomeBonus(userId: string) {
  await updateUserCredits(
    userId,
    10000,
    'bonus',
    'Welcome bonus'
  )
}
```

## Detailed Usage

### Authentication

#### Get Current User (Client)

```tsx
'use client'

import { getCurrentUser } from '@/lib/supabase/client'

export function UserProfile() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  return user ? <div>{user.email}</div> : null
}
```

#### Get Current User (Server)

```tsx
import { getCurrentUser } from '@/lib/supabase/server'

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Hello {user.email}</div>
}
```

#### Require Authentication

```tsx
import { requireAuth } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  const user = await requireAuth() // Redirects to /login if not authenticated

  return <div>Protected content for {user.email}</div>
}
```

#### Sign Out

```tsx
'use client'

import { signOut } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return <button onClick={handleSignOut}>Sign Out</button>
}
```

### User Profile

#### Get User Profile

```tsx
import { getUserProfile } from '@/lib/supabase/server'

export default async function CreditsDisplay() {
  const profile = await getUserProfile()

  return (
    <div>
      <p>Credits: {profile?.credits_balance}</p>
      <p>Role: {profile?.role}</p>
    </div>
  )
}
```

#### Check User Role

```tsx
import { hasRole } from '@/lib/supabase/server'

export default async function AdminPanel() {
  const isAdmin = await hasRole('admin')

  if (!isAdmin) {
    return <div>Access denied</div>
  }

  return <div>Admin content</div>
}
```

### Credit Management

#### Update Credits

```tsx
'use server'

import { updateUserCredits } from '@/lib/supabase/admin'

export async function deductCreditsForGeneration(
  userId: string,
  characterCount: number,
  generationId: string
) {
  const result = await updateUserCredits(
    userId,
    -characterCount, // Negative to deduct
    'generation',
    `Voice generation (${characterCount} chars)`,
    generationId
  )

  return result
}
```

#### Check Credit Balance

```tsx
import { getUserCredits, hasSufficientCredits } from '@/lib/supabase/admin'

export async function checkCanGenerate(userId: string, textLength: number) {
  const hasEnough = await hasSufficientCredits(userId, textLength)

  if (!hasEnough) {
    const currentBalance = await getUserCredits(userId)
    throw new Error(
      `Insufficient credits. You have ${currentBalance}, need ${textLength}`
    )
  }

  return true
}
```

### Database Operations

#### Insert Data

```tsx
'use server'

import { createClient } from '@/lib/supabase/server'
import type { ProjectInsert } from '@/types/database'

export async function createProject(data: ProjectInsert) {
  const supabase = createClient()

  const { data: project, error } = await supabase
    .from('voicegen_projects')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return project
}
```

#### Query with Filters

```tsx
import { createClient } from '@/lib/supabase/server'

export async function getActiveVoices(language: string = 'en') {
  const supabase = createClient()

  const { data: voices } = await supabase
    .from('voicegen_voices')
    .select('*')
    .eq('is_active', true)
    .eq('language', language)
    .order('name', { ascending: true })

  return voices || []
}
```

#### Update Data

```tsx
'use server'

import { createClient } from '@/lib/supabase/server'

export async function updateGeneration(
  id: string,
  updates: {
    status?: string
    audio_url?: string
    completed_at?: string
  }
) {
  const supabase = createClient()

  const { error } = await supabase
    .from('voicegen_generations')
    .update(updates)
    .eq('id', id)

  if (error) throw error
}
```

#### Delete Data

```tsx
'use server'

import { createClient } from '@/lib/supabase/server'

export async function deleteProject(projectId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('voicegen_projects')
    .delete()
    .eq('id', projectId)

  if (error) throw error
}
```

### TypeScript Types

All database types are available from `@/types/database`:

```tsx
import type {
  User,
  Project,
  Generation,
  Voice,
  UserInsert,
  ProjectInsert,
  GenerationUpdate,
  UserRole,
  GenerationStatus,
} from '@/types/database'

// Use in your functions
async function createProject(data: ProjectInsert): Promise<Project> {
  // ...
}

// Use in components
interface Props {
  user: User
  projects: Project[]
}
```

## Middleware Setup

The middleware is already configured in the root `middleware.ts` file. It handles:

- Session refresh
- Protected route redirects
- Auth route redirects (logged-in users can't access /login)
- Public route access

### Protected Routes

These routes require authentication:
- `/dashboard`
- `/generate`
- `/projects`
- `/history`
- `/library`
- `/settings`
- `/api/*` (most API routes)

### Auth Routes

These routes redirect to `/dashboard` if already authenticated:
- `/login`
- `/signup`
- `/reset-password`

### Public Routes

These routes are accessible to everyone:
- `/` (homepage)
- `/pricing`
- `/docs`
- `/api/health`

### Customizing Routes

Edit the route arrays in `src/lib/supabase/middleware.ts`:

```tsx
export const protectedRoutes = [
  '/dashboard',
  '/my-custom-protected-route',
  // ...
]
```

## API Route Examples

### POST Request with Authentication

```tsx
// app/api/generate/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const body = await request.json()

  // Your logic here
  const { data, error } = await supabase
    .from('voicegen_generations')
    .insert({
      user_id: user.id,
      text: body.text,
      voice_id: body.voiceId,
      // ...
    })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ data })
}
```

### GET Request with Filters

```tsx
// app/api/projects/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  const { data, error } = await supabase
    .from('voicegen_projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
```

## Best Practices

1. **Use the Right Client**
   - Browser client: Client Components only
   - Server client: Server Components, Server Actions, API Routes
   - Admin client: Only when you need to bypass RLS

2. **Never Expose Service Role Key**
   - Only use admin client in server-side code
   - Never send to browser or include in client bundles

3. **Type Safety**
   - Always use TypeScript types from `@/types/database`
   - Leverage autocomplete for table names and columns

4. **Error Handling**
   - Always check for errors from Supabase operations
   - Provide meaningful error messages to users

5. **RLS Policies**
   - Rely on RLS for data security
   - Only use admin client when absolutely necessary

6. **Session Management**
   - Middleware handles session refresh automatically
   - Use `requireAuth()` for protected Server Components

## Regenerating Types

When your database schema changes, regenerate types:

```bash
npm run db:types
```

This will update `src/types/database.ts` with the latest schema.

## Troubleshooting

### "User is not authenticated" errors
- Ensure cookies are being set properly
- Check that middleware is running
- Verify environment variables are set

### RLS policy errors
- Check that RLS policies are set up in Supabase
- Use admin client if you need to bypass RLS
- Verify the user has permission for the operation

### Type errors
- Run `npm run db:types` to regenerate types
- Ensure you're importing from `@/types/database`
- Check that your schema matches the types

## Additional Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Architecture Documentation](../../../docs/ARCHITECTURE.md)
