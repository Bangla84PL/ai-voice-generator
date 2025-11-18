/**
 * Supabase Client Utilities
 * Centralized exports for all Supabase clients and utilities
 */

// Browser client (Client Components)
export { createClient as createBrowserClient } from './client'
export { getCurrentUser as getCurrentUserClient } from './client'
export { getSession as getSessionClient } from './client'
export { signOut } from './client'
export type { SupabaseClient } from './client'

// Server client (Server Components, Server Actions)
export { createClient as createServerClient } from './server'
export { getCurrentUser as getCurrentUserServer } from './server'
export { getSession as getSessionServer } from './server'
export { getUserProfile } from './server'
export { requireAuth } from './server'
export { hasRole } from './server'
export type { SupabaseServer } from './server'

// Admin client (Server-side admin operations)
export { createAdminClient } from './admin'
export {
  updateUserCredits,
  getUserCredits,
  hasSufficientCredits,
  createUserProfile,
  updateUserRole,
  deleteUser,
  getAllUsers,
} from './admin'
export type { SupabaseAdmin } from './admin'

// Middleware utilities
export {
  middleware as supabaseMiddleware,
  updateSession,
  isProtectedRoute,
  isAuthRoute,
  isPublicRoute,
  getUserRole,
  getUserProfile as getUserProfileMiddleware,
  middlewareMatcher,
  protectedRoutes,
  authRoutes,
  publicRoutes,
} from './middleware'

// Database types
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  User,
  Project,
  Generation,
  Voice,
  CustomVoice,
  Credit,
  Subscription,
  ApiKey,
  Webhook,
  UserInsert,
  ProjectInsert,
  GenerationInsert,
  VoiceInsert,
  CustomVoiceInsert,
  CreditInsert,
  SubscriptionInsert,
  ApiKeyInsert,
  WebhookInsert,
  UserUpdate,
  ProjectUpdate,
  GenerationUpdate,
  VoiceUpdate,
  CustomVoiceUpdate,
  CreditUpdate,
  SubscriptionUpdate,
  ApiKeyUpdate,
  WebhookUpdate,
  UserRole,
  GenerationStatus,
  VoiceProvider,
  VoiceGender,
  VoiceAge,
  CustomVoiceStatus,
  CreditType,
  SubscriptionPlan,
  SubscriptionStatus,
} from '@/types/database'
