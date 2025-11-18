-- ============================================================================
-- AI Voice Generator - Supabase Database Schema
-- ============================================================================
-- Description: Complete database schema for the SmartCamp.AI Voice Generator
-- Version: 1.0.0
-- Created: 2025-11-18
-- ============================================================================

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User roles
CREATE TYPE user_role AS ENUM ('user', 'pro', 'enterprise', 'admin');

-- Voice providers
CREATE TYPE voice_provider AS ENUM ('openai', 'elevenlabs', 'azure');

-- Voice gender
CREATE TYPE voice_gender AS ENUM ('male', 'female', 'neutral');

-- Voice age
CREATE TYPE voice_age AS ENUM ('young', 'adult', 'senior');

-- Generation status
CREATE TYPE generation_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Custom voice status
CREATE TYPE custom_voice_status AS ENUM ('pending', 'training', 'ready', 'failed');

-- Credit transaction types
CREATE TYPE credit_type AS ENUM ('purchase', 'subscription', 'generation', 'refund', 'bonus');

-- Subscription plans
CREATE TYPE subscription_plan AS ENUM ('pro', 'enterprise');

-- Subscription status
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'paused');

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. voicegen_users (User profiles extending auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE voicegen_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'user',
    credits_balance INTEGER NOT NULL DEFAULT 10000,
    subscription_id UUID,
    api_key_hash TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT positive_credits CHECK (credits_balance >= 0)
);

COMMENT ON TABLE voicegen_users IS 'User profiles extending Supabase auth.users';
COMMENT ON COLUMN voicegen_users.id IS 'Foreign key to auth.users.id';
COMMENT ON COLUMN voicegen_users.credits_balance IS 'Current credit balance (1 credit = 1 character)';
COMMENT ON COLUMN voicegen_users.preferences IS 'JSON object storing user preferences (theme, default settings, etc.)';

-- ----------------------------------------------------------------------------
-- 2. voicegen_projects (User projects for organizing generations)
-- ----------------------------------------------------------------------------
CREATE TABLE voicegen_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES voicegen_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 200)
);

COMMENT ON TABLE voicegen_projects IS 'User projects for organizing voice generations';
COMMENT ON COLUMN voicegen_projects.settings IS 'JSON object for default voice, speed, pitch, etc.';

-- ----------------------------------------------------------------------------
-- 3. voicegen_voices (Available voices from providers)
-- ----------------------------------------------------------------------------
CREATE TABLE voicegen_voices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    provider voice_provider NOT NULL,
    provider_voice_id TEXT NOT NULL,
    gender voice_gender NOT NULL,
    age voice_age NOT NULL,
    accent TEXT,
    language TEXT NOT NULL DEFAULT 'en-US',
    description TEXT,
    sample_url TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_provider_voice UNIQUE (provider, provider_voice_id)
);

COMMENT ON TABLE voicegen_voices IS 'Available voices from AI providers (OpenAI, ElevenLabs, Azure)';
COMMENT ON COLUMN voicegen_voices.provider_voice_id IS 'Voice ID from the provider (e.g., "alloy" for OpenAI)';
COMMENT ON COLUMN voicegen_voices.accent IS 'Voice accent (e.g., "US", "UK", "Australian")';
COMMENT ON COLUMN voicegen_voices.language IS 'ISO language code (e.g., "en-US", "es-ES")';
COMMENT ON COLUMN voicegen_voices.tags IS 'Array of tags for filtering (e.g., ["professional", "warm", "energetic"])';

-- ----------------------------------------------------------------------------
-- 4. voicegen_generations (Voice generation jobs)
-- ----------------------------------------------------------------------------
CREATE TABLE voicegen_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES voicegen_users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES voicegen_projects(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    character_count INTEGER NOT NULL,
    voice_id UUID NOT NULL REFERENCES voicegen_voices(id) ON DELETE RESTRICT,
    settings JSONB DEFAULT '{}'::jsonb,
    status generation_status NOT NULL DEFAULT 'pending',
    audio_url TEXT,
    audio_duration FLOAT,
    credits_used INTEGER NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    CONSTRAINT text_length CHECK (char_length(text) >= 1 AND char_length(text) <= 10000),
    CONSTRAINT positive_character_count CHECK (character_count > 0),
    CONSTRAINT positive_credits CHECK (credits_used >= 0),
    CONSTRAINT positive_duration CHECK (audio_duration IS NULL OR audio_duration > 0),
    CONSTRAINT completed_requires_url CHECK (
        (status = 'completed' AND audio_url IS NOT NULL AND completed_at IS NOT NULL) OR
        (status != 'completed')
    ),
    CONSTRAINT failed_requires_error CHECK (
        (status = 'failed' AND error_message IS NOT NULL) OR
        (status != 'failed')
    )
);

COMMENT ON TABLE voicegen_generations IS 'Voice generation jobs and their results';
COMMENT ON COLUMN voicegen_generations.text IS 'Input text to be converted to speech';
COMMENT ON COLUMN voicegen_generations.character_count IS 'Number of characters in the text';
COMMENT ON COLUMN voicegen_generations.settings IS 'JSON object for speed, pitch, tone, format (mp3/wav/etc.)';
COMMENT ON COLUMN voicegen_generations.audio_url IS 'Signed URL to the generated audio file in storage';
COMMENT ON COLUMN voicegen_generations.audio_duration IS 'Duration of the generated audio in seconds';
COMMENT ON COLUMN voicegen_generations.credits_used IS 'Number of credits consumed (1 credit = 1 character)';

-- ----------------------------------------------------------------------------
-- 5. voicegen_custom_voices (Custom voice clones for Pro/Enterprise users)
-- ----------------------------------------------------------------------------
CREATE TABLE voicegen_custom_voices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES voicegen_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sample_audio_url TEXT NOT NULL,
    provider_model_id TEXT,
    status custom_voice_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);

COMMENT ON TABLE voicegen_custom_voices IS 'Custom voice clones created by Pro/Enterprise users';
COMMENT ON COLUMN voicegen_custom_voices.sample_audio_url IS 'URL to the voice sample used for cloning';
COMMENT ON COLUMN voicegen_custom_voices.provider_model_id IS 'Voice model ID from the provider after training';

-- ----------------------------------------------------------------------------
-- 6. voicegen_credits (Credit transaction history)
-- ----------------------------------------------------------------------------
CREATE TABLE voicegen_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES voicegen_users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type credit_type NOT NULL,
    description TEXT NOT NULL,
    reference_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT non_zero_amount CHECK (amount != 0)
);

COMMENT ON TABLE voicegen_credits IS 'Credit transaction history for all users';
COMMENT ON COLUMN voicegen_credits.amount IS 'Positive for credits added, negative for credits used';
COMMENT ON COLUMN voicegen_credits.type IS 'Type of transaction (purchase, subscription, generation, refund, bonus)';
COMMENT ON COLUMN voicegen_credits.reference_id IS 'Optional reference to generation, subscription, or transaction';

-- ----------------------------------------------------------------------------
-- 7. voicegen_subscriptions (User subscription plans)
-- ----------------------------------------------------------------------------
CREATE TABLE voicegen_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES voicegen_users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT NOT NULL,
    plan subscription_plan NOT NULL,
    status subscription_status NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_period CHECK (current_period_end > current_period_start),
    CONSTRAINT unique_active_subscription UNIQUE (user_id, status)
        WHERE (status = 'active')
);

COMMENT ON TABLE voicegen_subscriptions IS 'User subscription plans (Pro/Enterprise) managed by Stripe';
COMMENT ON COLUMN voicegen_subscriptions.stripe_subscription_id IS 'Stripe subscription ID for webhook handling';
COMMENT ON COLUMN voicegen_subscriptions.stripe_customer_id IS 'Stripe customer ID';
COMMENT ON COLUMN voicegen_subscriptions.cancel_at_period_end IS 'If true, subscription will not renew';

-- Add foreign key from voicegen_users to voicegen_subscriptions
ALTER TABLE voicegen_users
    ADD CONSTRAINT fk_subscription
    FOREIGN KEY (subscription_id)
    REFERENCES voicegen_subscriptions(id)
    ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 8. voicegen_api_keys (API keys for external access - Pro/Enterprise only)
-- ----------------------------------------------------------------------------
CREATE TABLE voicegen_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES voicegen_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
    CONSTRAINT prefix_length CHECK (char_length(key_prefix) = 8)
);

COMMENT ON TABLE voicegen_api_keys IS 'API keys for external API access (Pro/Enterprise users only)';
COMMENT ON COLUMN voicegen_api_keys.key_hash IS 'Bcrypt hash of the API key';
COMMENT ON COLUMN voicegen_api_keys.key_prefix IS 'First 8 characters of the key for display purposes';

-- ----------------------------------------------------------------------------
-- 9. voicegen_webhooks (User-configured webhooks for events)
-- ----------------------------------------------------------------------------
CREATE TABLE voicegen_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES voicegen_users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    secret TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_url CHECK (url ~* '^https?://'),
    CONSTRAINT has_events CHECK (array_length(events, 1) > 0)
);

COMMENT ON TABLE voicegen_webhooks IS 'User-configured webhooks for receiving event notifications';
COMMENT ON COLUMN voicegen_webhooks.events IS 'Array of event types (e.g., ["generation.completed", "credit.low"])';
COMMENT ON COLUMN voicegen_webhooks.secret IS 'Secret key for signing webhook payloads';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- voicegen_users
CREATE INDEX idx_users_email ON voicegen_users(email);
CREATE INDEX idx_users_role ON voicegen_users(role);
CREATE INDEX idx_users_subscription ON voicegen_users(subscription_id);

-- voicegen_projects
CREATE INDEX idx_projects_user_id ON voicegen_projects(user_id);
CREATE INDEX idx_projects_created_at ON voicegen_projects(created_at DESC);

-- voicegen_voices
CREATE INDEX idx_voices_provider ON voicegen_voices(provider);
CREATE INDEX idx_voices_language ON voicegen_voices(language);
CREATE INDEX idx_voices_active ON voicegen_voices(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_voices_language_active ON voicegen_voices(language, is_active);
CREATE INDEX idx_voices_tags ON voicegen_voices USING GIN(tags);

-- voicegen_generations
CREATE INDEX idx_generations_user_id ON voicegen_generations(user_id);
CREATE INDEX idx_generations_project_id ON voicegen_generations(project_id);
CREATE INDEX idx_generations_status ON voicegen_generations(status);
CREATE INDEX idx_generations_user_created ON voicegen_generations(user_id, created_at DESC);
CREATE INDEX idx_generations_voice_id ON voicegen_generations(voice_id);

-- voicegen_custom_voices
CREATE INDEX idx_custom_voices_user_id ON voicegen_custom_voices(user_id);
CREATE INDEX idx_custom_voices_status ON voicegen_custom_voices(status);

-- voicegen_credits
CREATE INDEX idx_credits_user_id ON voicegen_credits(user_id);
CREATE INDEX idx_credits_user_created ON voicegen_credits(user_id, created_at DESC);
CREATE INDEX idx_credits_type ON voicegen_credits(type);
CREATE INDEX idx_credits_reference ON voicegen_credits(reference_id);

-- voicegen_subscriptions
CREATE INDEX idx_subscriptions_user_id ON voicegen_subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON voicegen_subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON voicegen_subscriptions(status);

-- voicegen_api_keys
CREATE INDEX idx_api_keys_user_id ON voicegen_api_keys(user_id);
CREATE INDEX idx_api_keys_active ON voicegen_api_keys(is_active) WHERE is_active = TRUE;

-- voicegen_webhooks
CREATE INDEX idx_webhooks_user_id ON voicegen_webhooks(user_id);
CREATE INDEX idx_webhooks_active ON voicegen_webhooks(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE voicegen_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE voicegen_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE voicegen_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE voicegen_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE voicegen_custom_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE voicegen_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE voicegen_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voicegen_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE voicegen_webhooks ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- voicegen_users policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own profile"
    ON voicegen_users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON voicegen_users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        -- Prevent users from modifying these fields
        role = (SELECT role FROM voicegen_users WHERE id = auth.uid()) AND
        credits_balance = (SELECT credits_balance FROM voicegen_users WHERE id = auth.uid())
    );

CREATE POLICY "Service role has full access to users"
    ON voicegen_users FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ----------------------------------------------------------------------------
-- voicegen_projects policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own projects"
    ON voicegen_projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
    ON voicegen_projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
    ON voicegen_projects FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
    ON voicegen_projects FOR DELETE
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- voicegen_voices policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Authenticated users can view active voices"
    ON voicegen_voices FOR SELECT
    USING (is_active = TRUE AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage voices"
    ON voicegen_voices FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM voicegen_users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ----------------------------------------------------------------------------
-- voicegen_generations policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own generations"
    ON voicegen_generations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generations"
    ON voicegen_generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations"
    ON voicegen_generations FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can update generations"
    ON voicegen_generations FOR UPDATE
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ----------------------------------------------------------------------------
-- voicegen_custom_voices policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own custom voices"
    ON voicegen_custom_voices FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Pro/Enterprise users can create custom voices"
    ON voicegen_custom_voices FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM voicegen_users
            WHERE id = auth.uid() AND role IN ('pro', 'enterprise', 'admin')
        )
    );

CREATE POLICY "Users can update their own custom voices"
    ON voicegen_custom_voices FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom voices"
    ON voicegen_custom_voices FOR DELETE
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- voicegen_credits policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own credit transactions"
    ON voicegen_credits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert credit transactions"
    ON voicegen_credits FOR INSERT
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can update credit transactions"
    ON voicegen_credits FOR UPDATE
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ----------------------------------------------------------------------------
-- voicegen_subscriptions policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own subscription"
    ON voicegen_subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
    ON voicegen_subscriptions FOR ALL
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ----------------------------------------------------------------------------
-- voicegen_api_keys policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own API keys"
    ON voicegen_api_keys FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Pro/Enterprise users can create API keys"
    ON voicegen_api_keys FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM voicegen_users
            WHERE id = auth.uid() AND role IN ('pro', 'enterprise', 'admin')
        )
    );

CREATE POLICY "Users can update their own API keys"
    ON voicegen_api_keys FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
    ON voicegen_api_keys FOR DELETE
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- voicegen_webhooks policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own webhooks"
    ON voicegen_webhooks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Pro/Enterprise users can create webhooks"
    ON voicegen_webhooks FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM voicegen_users
            WHERE id = auth.uid() AND role IN ('pro', 'enterprise', 'admin')
        )
    );

CREATE POLICY "Users can update their own webhooks"
    ON voicegen_webhooks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webhooks"
    ON voicegen_webhooks FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function to update updated_at timestamp
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION voicegen_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_voicegen_users_updated_at
    BEFORE UPDATE ON voicegen_users
    FOR EACH ROW
    EXECUTE FUNCTION voicegen_update_updated_at();

CREATE TRIGGER update_voicegen_projects_updated_at
    BEFORE UPDATE ON voicegen_projects
    FOR EACH ROW
    EXECUTE FUNCTION voicegen_update_updated_at();

CREATE TRIGGER update_voicegen_custom_voices_updated_at
    BEFORE UPDATE ON voicegen_custom_voices
    FOR EACH ROW
    EXECUTE FUNCTION voicegen_update_updated_at();

CREATE TRIGGER update_voicegen_subscriptions_updated_at
    BEFORE UPDATE ON voicegen_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION voicegen_update_updated_at();

CREATE TRIGGER update_voicegen_webhooks_updated_at
    BEFORE UPDATE ON voicegen_webhooks
    FOR EACH ROW
    EXECUTE FUNCTION voicegen_update_updated_at();

-- ----------------------------------------------------------------------------
-- Function to automatically create user profile on signup
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION voicegen_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO voicegen_users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );

    -- Grant welcome bonus credits
    INSERT INTO voicegen_credits (user_id, amount, type, description)
    VALUES (NEW.id, 10000, 'bonus', 'Welcome bonus: 10,000 free credits');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION voicegen_handle_new_user();

-- ----------------------------------------------------------------------------
-- Function to update user credits balance
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION voicegen_update_credits_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE voicegen_users
    SET credits_balance = credits_balance + NEW.amount
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update credits balance on credit transaction
CREATE TRIGGER on_credit_transaction
    AFTER INSERT ON voicegen_credits
    FOR EACH ROW
    EXECUTE FUNCTION voicegen_update_credits_balance();

-- ----------------------------------------------------------------------------
-- Function to calculate character count
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION voicegen_calculate_character_count()
RETURNS TRIGGER AS $$
BEGIN
    NEW.character_count = char_length(NEW.text);

    -- Set credits_used equal to character_count (1 credit = 1 character)
    IF NEW.credits_used IS NULL OR NEW.credits_used = 0 THEN
        NEW.credits_used = NEW.character_count;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate character count before insert
CREATE TRIGGER calculate_generation_character_count
    BEFORE INSERT ON voicegen_generations
    FOR EACH ROW
    EXECUTE FUNCTION voicegen_calculate_character_count();

-- ----------------------------------------------------------------------------
-- Function to deduct credits on generation creation
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION voicegen_deduct_credits_on_generation()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a credit debit transaction
    INSERT INTO voicegen_credits (user_id, amount, type, description, reference_id)
    VALUES (
        NEW.user_id,
        -NEW.credits_used,
        'generation',
        'Voice generation: ' || LEFT(NEW.text, 50) || '...',
        NEW.id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to deduct credits when generation is created
CREATE TRIGGER deduct_credits_on_generation
    AFTER INSERT ON voicegen_generations
    FOR EACH ROW
    EXECUTE FUNCTION voicegen_deduct_credits_on_generation();

-- ----------------------------------------------------------------------------
-- Function to refund credits on generation failure
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION voicegen_refund_credits_on_failure()
RETURNS TRIGGER AS $$
BEGIN
    -- Only refund if status changed to 'failed' from non-failed status
    IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
        INSERT INTO voicegen_credits (user_id, amount, type, description, reference_id)
        VALUES (
            NEW.user_id,
            NEW.credits_used,
            'refund',
            'Refund for failed generation',
            NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to refund credits on generation failure
CREATE TRIGGER refund_credits_on_failure
    AFTER UPDATE ON voicegen_generations
    FOR EACH ROW
    WHEN (NEW.status = 'failed' AND OLD.status != 'failed')
    EXECUTE FUNCTION voicegen_refund_credits_on_failure();

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Note: Storage buckets need to be created via Supabase Dashboard or API
-- The following is documentation of the bucket configuration

-- ----------------------------------------------------------------------------
-- Bucket: voicegen-audio (Generated audio files)
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'voicegen-audio',
    'voicegen-audio',
    FALSE,
    52428800, -- 50MB limit
    ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp3']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policy: Users can read their own audio files
CREATE POLICY "Users can read their own audio files"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'voicegen-audio' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage RLS policy: Service role can insert audio files
CREATE POLICY "Service role can insert audio files"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'voicegen-audio' AND
        auth.jwt()->>'role' = 'service_role'
    );

-- Storage RLS policy: Users can delete their own audio files
CREATE POLICY "Users can delete their own audio files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'voicegen-audio' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ----------------------------------------------------------------------------
-- Bucket: voicegen-voice-samples (Voice cloning samples)
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'voicegen-voice-samples',
    'voicegen-voice-samples',
    FALSE,
    10485760, -- 10MB limit
    ARRAY['audio/wav', 'audio/mp3', 'audio/mpeg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policy: Pro/Enterprise users can upload voice samples
CREATE POLICY "Pro/Enterprise users can upload voice samples"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'voicegen-voice-samples' AND
        auth.uid()::text = (storage.foldername(name))[1] AND
        EXISTS (
            SELECT 1 FROM voicegen_users
            WHERE id = auth.uid() AND role IN ('pro', 'enterprise', 'admin')
        )
    );

-- Storage RLS policy: Users can read their own voice samples
CREATE POLICY "Users can read their own voice samples"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'voicegen-voice-samples' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Storage RLS policy: Users can delete their own voice samples
CREATE POLICY "Users can delete their own voice samples"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'voicegen-voice-samples' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ----------------------------------------------------------------------------
-- Bucket: voicegen-invoices (PDF invoices)
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'voicegen-invoices',
    'voicegen-invoices',
    FALSE,
    5242880, -- 5MB limit
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policy: Service role can insert invoices
CREATE POLICY "Service role can insert invoices"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'voicegen-invoices' AND
        auth.jwt()->>'role' = 'service_role'
    );

-- Storage RLS policy: Users can read their own invoices
CREATE POLICY "Users can read their own invoices"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'voicegen-invoices' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- View: User stats
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW voicegen_user_stats AS
SELECT
    u.id AS user_id,
    u.email,
    u.role,
    u.credits_balance,
    COUNT(DISTINCT g.id) AS total_generations,
    COALESCE(SUM(g.credits_used), 0) AS total_credits_used,
    COALESCE(SUM(g.audio_duration), 0) AS total_audio_duration,
    COUNT(DISTINCT p.id) AS total_projects,
    COUNT(DISTINCT CASE WHEN g.created_at >= NOW() - INTERVAL '30 days' THEN g.id END) AS generations_last_30_days
FROM voicegen_users u
LEFT JOIN voicegen_generations g ON u.id = g.user_id
LEFT JOIN voicegen_projects p ON u.id = p.user_id
GROUP BY u.id, u.email, u.role, u.credits_balance;

COMMENT ON VIEW voicegen_user_stats IS 'Aggregated statistics for each user';

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Function: Get user credit balance
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION voicegen_get_user_credits(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_balance INTEGER;
BEGIN
    SELECT credits_balance INTO v_balance
    FROM voicegen_users
    WHERE id = p_user_id;

    RETURN COALESCE(v_balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION voicegen_get_user_credits IS 'Get the current credit balance for a user';

-- ----------------------------------------------------------------------------
-- Function: Check if user can generate (has enough credits)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION voicegen_can_generate(p_user_id UUID, p_character_count INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    v_balance INTEGER;
BEGIN
    SELECT credits_balance INTO v_balance
    FROM voicegen_users
    WHERE id = p_user_id;

    RETURN COALESCE(v_balance, 0) >= p_character_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION voicegen_can_generate IS 'Check if user has enough credits to generate text';

-- ============================================================================
-- SEED DATA (Optional - for development)
-- ============================================================================

-- Insert some sample voices (OpenAI voices)
INSERT INTO voicegen_voices (name, provider, provider_voice_id, gender, age, accent, language, description, is_premium, is_active) VALUES
('Alloy', 'openai', 'alloy', 'neutral', 'adult', 'US', 'en-US', 'A balanced, neutral voice suitable for most content', FALSE, TRUE),
('Echo', 'openai', 'echo', 'male', 'adult', 'US', 'en-US', 'A clear, professional male voice', FALSE, TRUE),
('Fable', 'openai', 'fable', 'neutral', 'adult', 'UK', 'en-GB', 'A warm, storytelling voice with British accent', FALSE, TRUE),
('Onyx', 'openai', 'onyx', 'male', 'adult', 'US', 'en-US', 'A deep, authoritative male voice', FALSE, TRUE),
('Nova', 'openai', 'nova', 'female', 'young', 'US', 'en-US', 'A bright, energetic female voice', FALSE, TRUE),
('Shimmer', 'openai', 'shimmer', 'female', 'adult', 'US', 'en-US', 'A warm, friendly female voice', FALSE, TRUE)
ON CONFLICT (provider, provider_voice_id) DO NOTHING;

-- ============================================================================
-- GRANTS (Ensure Supabase auth can access)
-- ============================================================================

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ============================================================================
-- COMPLETE
-- ============================================================================

-- Schema creation complete!
-- Next steps:
-- 1. Run this schema in your Supabase project
-- 2. Create storage buckets in Supabase Dashboard
-- 3. Generate TypeScript types: npx supabase gen types typescript
-- 4. Update .env with Supabase credentials
-- 5. Test authentication flow
