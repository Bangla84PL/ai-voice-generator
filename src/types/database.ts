/**
 * Database Types for AI Voice Generator
 * Generated for use with Supabase
 *
 * Run `npm run db:types` to regenerate from actual database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      voicegen_users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'user' | 'pro' | 'enterprise' | 'admin'
          credits_balance: number
          subscription_id: string | null
          api_key_hash: string | null
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'pro' | 'enterprise' | 'admin'
          credits_balance?: number
          subscription_id?: string | null
          api_key_hash?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'pro' | 'enterprise' | 'admin'
          credits_balance?: number
          subscription_id?: string | null
          api_key_hash?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voicegen_users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      voicegen_projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voicegen_projects_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "voicegen_users"
            referencedColumns: ["id"]
          }
        ]
      }
      voicegen_generations: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          text: string
          character_count: number
          voice_id: string
          settings: Json | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          audio_url: string | null
          audio_duration: number | null
          credits_used: number
          error_message: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          text: string
          character_count: number
          voice_id: string
          settings?: Json | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          audio_url?: string | null
          audio_duration?: number | null
          credits_used: number
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          text?: string
          character_count?: number
          voice_id?: string
          settings?: Json | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          audio_url?: string | null
          audio_duration?: number | null
          credits_used?: number
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voicegen_generations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "voicegen_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voicegen_generations_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "voicegen_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voicegen_generations_voice_id_fkey"
            columns: ["voice_id"]
            referencedRelation: "voicegen_voices"
            referencedColumns: ["id"]
          }
        ]
      }
      voicegen_voices: {
        Row: {
          id: string
          name: string
          provider: 'openai' | 'elevenlabs' | 'azure'
          provider_voice_id: string
          gender: 'male' | 'female' | 'neutral'
          age: 'young' | 'adult' | 'senior'
          accent: string
          language: string
          description: string
          sample_url: string | null
          tags: string[]
          is_premium: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          provider: 'openai' | 'elevenlabs' | 'azure'
          provider_voice_id: string
          gender: 'male' | 'female' | 'neutral'
          age: 'young' | 'adult' | 'senior'
          accent: string
          language: string
          description: string
          sample_url?: string | null
          tags?: string[]
          is_premium?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          provider?: 'openai' | 'elevenlabs' | 'azure'
          provider_voice_id?: string
          gender?: 'male' | 'female' | 'neutral'
          age?: 'young' | 'adult' | 'senior'
          accent?: string
          language?: string
          description?: string
          sample_url?: string | null
          tags?: string[]
          is_premium?: boolean
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      voicegen_custom_voices: {
        Row: {
          id: string
          user_id: string
          name: string
          sample_audio_url: string
          provider_model_id: string | null
          status: 'pending' | 'training' | 'ready' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          sample_audio_url: string
          provider_model_id?: string | null
          status?: 'pending' | 'training' | 'ready' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          sample_audio_url?: string
          provider_model_id?: string | null
          status?: 'pending' | 'training' | 'ready' | 'failed'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voicegen_custom_voices_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "voicegen_users"
            referencedColumns: ["id"]
          }
        ]
      }
      voicegen_credits: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'purchase' | 'subscription' | 'generation' | 'refund' | 'bonus'
          description: string
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: 'purchase' | 'subscription' | 'generation' | 'refund' | 'bonus'
          description: string
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: 'purchase' | 'subscription' | 'generation' | 'refund' | 'bonus'
          description?: string
          reference_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voicegen_credits_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "voicegen_users"
            referencedColumns: ["id"]
          }
        ]
      }
      voicegen_subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          plan: 'pro' | 'enterprise'
          status: 'active' | 'canceled' | 'past_due' | 'paused'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          plan: 'pro' | 'enterprise'
          status?: 'active' | 'canceled' | 'past_due' | 'paused'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          plan?: 'pro' | 'enterprise'
          status?: 'active' | 'canceled' | 'past_due' | 'paused'
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voicegen_subscriptions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "voicegen_users"
            referencedColumns: ["id"]
          }
        ]
      }
      voicegen_api_keys: {
        Row: {
          id: string
          user_id: string
          name: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          expires_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voicegen_api_keys_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "voicegen_users"
            referencedColumns: ["id"]
          }
        ]
      }
      voicegen_webhooks: {
        Row: {
          id: string
          user_id: string
          url: string
          events: string[]
          secret: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          events: string[]
          secret: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          events?: string[]
          secret?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "voicegen_webhooks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "voicegen_users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'user' | 'pro' | 'enterprise' | 'admin'
      generation_status: 'pending' | 'processing' | 'completed' | 'failed'
      voice_provider: 'openai' | 'elevenlabs' | 'azure'
      voice_gender: 'male' | 'female' | 'neutral'
      voice_age: 'young' | 'adult' | 'senior'
      custom_voice_status: 'pending' | 'training' | 'ready' | 'failed'
      credit_type: 'purchase' | 'subscription' | 'generation' | 'refund' | 'bonus'
      subscription_plan: 'pro' | 'enterprise'
      subscription_status: 'active' | 'canceled' | 'past_due' | 'paused'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier access
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

// Specific type exports for convenience
export type User = Tables<'voicegen_users'>
export type Project = Tables<'voicegen_projects'>
export type Generation = Tables<'voicegen_generations'>
export type Voice = Tables<'voicegen_voices'>
export type CustomVoice = Tables<'voicegen_custom_voices'>
export type Credit = Tables<'voicegen_credits'>
export type Subscription = Tables<'voicegen_subscriptions'>
export type ApiKey = Tables<'voicegen_api_keys'>
export type Webhook = Tables<'voicegen_webhooks'>

// Insert types
export type UserInsert = TablesInsert<'voicegen_users'>
export type ProjectInsert = TablesInsert<'voicegen_projects'>
export type GenerationInsert = TablesInsert<'voicegen_generations'>
export type VoiceInsert = TablesInsert<'voicegen_voices'>
export type CustomVoiceInsert = TablesInsert<'voicegen_custom_voices'>
export type CreditInsert = TablesInsert<'voicegen_credits'>
export type SubscriptionInsert = TablesInsert<'voicegen_subscriptions'>
export type ApiKeyInsert = TablesInsert<'voicegen_api_keys'>
export type WebhookInsert = TablesInsert<'voicegen_webhooks'>

// Update types
export type UserUpdate = TablesUpdate<'voicegen_users'>
export type ProjectUpdate = TablesUpdate<'voicegen_projects'>
export type GenerationUpdate = TablesUpdate<'voicegen_generations'>
export type VoiceUpdate = TablesUpdate<'voicegen_voices'>
export type CustomVoiceUpdate = TablesUpdate<'voicegen_custom_voices'>
export type CreditUpdate = TablesUpdate<'voicegen_credits'>
export type SubscriptionUpdate = TablesUpdate<'voicegen_subscriptions'>
export type ApiKeyUpdate = TablesUpdate<'voicegen_api_keys'>
export type WebhookUpdate = TablesUpdate<'voicegen_webhooks'>

// Enum types
export type UserRole = Enums<'user_role'>
export type GenerationStatus = Enums<'generation_status'>
export type VoiceProvider = Enums<'voice_provider'>
export type VoiceGender = Enums<'voice_gender'>
export type VoiceAge = Enums<'voice_age'>
export type CustomVoiceStatus = Enums<'custom_voice_status'>
export type CreditType = Enums<'credit_type'>
export type SubscriptionPlan = Enums<'subscription_plan'>
export type SubscriptionStatus = Enums<'subscription_status'>
