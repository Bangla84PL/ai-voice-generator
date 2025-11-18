#!/usr/bin/env node
/**
 * =============================================================================
 * Voice Seeding Script
 * =============================================================================
 * Populates the voicegen_voices table with available AI voices from:
 * - OpenAI TTS
 * - ElevenLabs
 *
 * Usage:
 *   npm run db:seed
 *   node scripts/seed-voices.js
 * =============================================================================
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// =============================================================================
// Configuration
// =============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// =============================================================================
// Voice Data
// =============================================================================

const voices = [
  // ---------------------------------------------------------------------------
  // OpenAI Voices (6 voices)
  // ---------------------------------------------------------------------------
  {
    name: 'Alloy',
    provider: 'openai',
    provider_voice_id: 'alloy',
    gender: 'neutral',
    age: 'adult',
    accent: 'US',
    language: 'en-US',
    description: 'A balanced, neutral voice suitable for most content. Clear and professional with a warm tone.',
    tags: ['neutral', 'professional', 'versatile', 'clear'],
    is_premium: false,
    is_active: true
  },
  {
    name: 'Echo',
    provider: 'openai',
    provider_voice_id: 'echo',
    gender: 'male',
    age: 'adult',
    accent: 'US',
    language: 'en-US',
    description: 'A clear, professional male voice. Great for narration and formal content.',
    tags: ['male', 'professional', 'authoritative', 'clear'],
    is_premium: false,
    is_active: true
  },
  {
    name: 'Fable',
    provider: 'openai',
    provider_voice_id: 'fable',
    gender: 'neutral',
    age: 'adult',
    accent: 'UK',
    language: 'en-GB',
    description: 'A warm, storytelling voice with British accent. Perfect for narratives and audiobooks.',
    tags: ['storytelling', 'warm', 'british', 'narrative'],
    is_premium: false,
    is_active: true
  },
  {
    name: 'Onyx',
    provider: 'openai',
    provider_voice_id: 'onyx',
    gender: 'male',
    age: 'adult',
    accent: 'US',
    language: 'en-US',
    description: 'A deep, authoritative male voice. Ideal for serious content and announcements.',
    tags: ['male', 'deep', 'authoritative', 'powerful'],
    is_premium: false,
    is_active: true
  },
  {
    name: 'Nova',
    provider: 'openai',
    provider_voice_id: 'nova',
    gender: 'female',
    age: 'young',
    accent: 'US',
    language: 'en-US',
    description: 'A bright, energetic female voice. Great for upbeat content and tutorials.',
    tags: ['female', 'energetic', 'bright', 'friendly'],
    is_premium: false,
    is_active: true
  },
  {
    name: 'Shimmer',
    provider: 'openai',
    provider_voice_id: 'shimmer',
    gender: 'female',
    age: 'adult',
    accent: 'US',
    language: 'en-US',
    description: 'A warm, friendly female voice. Perfect for conversational content and presentations.',
    tags: ['female', 'warm', 'friendly', 'conversational'],
    is_premium: false,
    is_active: true
  },

  // ---------------------------------------------------------------------------
  // ElevenLabs Voices (Premium)
  // ---------------------------------------------------------------------------
  {
    name: 'Rachel',
    provider: 'elevenlabs',
    provider_voice_id: '21m00Tcm4TlvDq8ikWAM',
    gender: 'female',
    age: 'adult',
    accent: 'US',
    language: 'en-US',
    description: 'Calm, professional female voice. Excellent for corporate content and presentations.',
    tags: ['female', 'professional', 'calm', 'corporate', 'premium'],
    is_premium: true,
    is_active: true
  },
  {
    name: 'Domi',
    provider: 'elevenlabs',
    provider_voice_id: 'AZnzlk1XvdvUeBnXmlld',
    gender: 'female',
    age: 'adult',
    accent: 'US',
    language: 'en-US',
    description: 'Strong, confident female voice. Great for motivational and leadership content.',
    tags: ['female', 'confident', 'strong', 'motivational', 'premium'],
    is_premium: true,
    is_active: true
  },
  {
    name: 'Bella',
    provider: 'elevenlabs',
    provider_voice_id: 'EXAVITQu4vr4xnSDxMaL',
    gender: 'female',
    age: 'young',
    accent: 'US',
    language: 'en-US',
    description: 'Soft, expressive female voice. Perfect for storytelling and emotional content.',
    tags: ['female', 'soft', 'expressive', 'storytelling', 'premium'],
    is_premium: true,
    is_active: true
  },
  {
    name: 'Antoni',
    provider: 'elevenlabs',
    provider_voice_id: 'ErXwobaYiN019PkySvjV',
    gender: 'male',
    age: 'adult',
    accent: 'US',
    language: 'en-US',
    description: 'Well-rounded male voice. Versatile for various content types and tones.',
    tags: ['male', 'versatile', 'balanced', 'professional', 'premium'],
    is_premium: true,
    is_active: true
  },
  {
    name: 'Elli',
    provider: 'elevenlabs',
    provider_voice_id: 'MF3mGyEYCl7XYWbV9V6O',
    gender: 'female',
    age: 'young',
    accent: 'US',
    language: 'en-US',
    description: 'Youthful, energetic female voice. Ideal for casual and engaging content.',
    tags: ['female', 'young', 'energetic', 'casual', 'premium'],
    is_premium: true,
    is_active: true
  },
  {
    name: 'Josh',
    provider: 'elevenlabs',
    provider_voice_id: 'TxGEqnHWrfWFTfGW9XjX',
    gender: 'male',
    age: 'adult',
    accent: 'US',
    language: 'en-US',
    description: 'Deep, natural male voice. Excellent for narration and audiobooks.',
    tags: ['male', 'deep', 'natural', 'narration', 'premium'],
    is_premium: true,
    is_active: true
  },
  {
    name: 'Arnold',
    provider: 'elevenlabs',
    provider_voice_id: 'VR6AewLTigWG4xSOukaG',
    gender: 'male',
    age: 'adult',
    accent: 'US',
    language: 'en-US',
    description: 'Crisp, authoritative male voice. Perfect for news and formal announcements.',
    tags: ['male', 'authoritative', 'crisp', 'news', 'premium'],
    is_premium: true,
    is_active: true
  },
  {
    name: 'Adam',
    provider: 'elevenlabs',
    provider_voice_id: 'pNInz6obpgDQGcFmaJgB',
    gender: 'male',
    age: 'adult',
    accent: 'US',
    language: 'en-US',
    description: 'Deep, resonant male voice. Great for dramatic and impactful content.',
    tags: ['male', 'deep', 'resonant', 'dramatic', 'premium'],
    is_premium: true,
    is_active: true
  },
  {
    name: 'Sam',
    provider: 'elevenlabs',
    provider_voice_id: 'yoZ06aMxZJJ28mfd3POQ',
    gender: 'male',
    age: 'young',
    accent: 'US',
    language: 'en-US',
    description: 'Raspy, dynamic male voice. Unique for creative and artistic content.',
    tags: ['male', 'raspy', 'dynamic', 'creative', 'premium'],
    is_premium: true,
    is_active: true
  },
  {
    name: 'Charlotte',
    provider: 'elevenlabs',
    provider_voice_id: 'XB0fDUnXU5powFXDhCwa',
    gender: 'female',
    age: 'adult',
    accent: 'UK',
    language: 'en-GB',
    description: 'Seductive, sophisticated British female voice. Perfect for luxury and premium content.',
    tags: ['female', 'sophisticated', 'british', 'luxury', 'premium'],
    is_premium: true,
    is_active: true
  },
  {
    name: 'Matilda',
    provider: 'elevenlabs',
    provider_voice_id: 'XrExE9yKIg1WjnnlVkGX',
    gender: 'female',
    age: 'adult',
    accent: 'US',
    language: 'en-US',
    description: 'Warm, approachable female voice. Great for educational and tutorial content.',
    tags: ['female', 'warm', 'approachable', 'educational', 'premium'],
    is_premium: true,
    is_active: true
  }
];

// =============================================================================
// Main Function
// =============================================================================

async function seedVoices() {
  console.log('🎤 Starting voice seeding...\n');

  try {
    // Check connection
    const { data: testData, error: testError } = await supabase
      .from('voicegen_voices')
      .select('count')
      .limit(1);

    if (testError) {
      throw new Error(`Database connection failed: ${testError.message}`);
    }

    console.log('✅ Database connection successful\n');

    // Insert voices
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const voice of voices) {
      try {
        const { data, error } = await supabase
          .from('voicegen_voices')
          .upsert(voice, {
            onConflict: 'provider,provider_voice_id',
            ignoreDuplicates: false
          })
          .select();

        if (error) {
          if (error.code === '23505') {
            // Unique constraint violation - voice already exists
            console.log(`⏭️  Skipped: ${voice.name} (${voice.provider}) - already exists`);
            skipCount++;
          } else {
            throw error;
          }
        } else {
          console.log(`✅ Inserted: ${voice.name} (${voice.provider})`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Error inserting ${voice.name}: ${err.message}`);
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Seeding Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully inserted: ${successCount}`);
    console.log(`⏭️  Skipped (already exist): ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📝 Total voices: ${voices.length}`);
    console.log('='.repeat(60) + '\n');

    // Display voice breakdown
    const openaiVoices = voices.filter(v => v.provider === 'openai').length;
    const elevenlabsVoices = voices.filter(v => v.provider === 'elevenlabs').length;
    const premiumVoices = voices.filter(v => v.is_premium).length;

    console.log('🎭 Voice Breakdown:');
    console.log(`   OpenAI: ${openaiVoices}`);
    console.log(`   ElevenLabs: ${elevenlabsVoices}`);
    console.log(`   Premium: ${premiumVoices}`);
    console.log(`   Free: ${voices.length - premiumVoices}\n`);

    if (errorCount === 0) {
      console.log('🎉 Voice seeding completed successfully!');
      process.exit(0);
    } else {
      console.log('⚠️  Voice seeding completed with some errors.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Fatal error during seeding:');
    console.error(error);
    process.exit(1);
  }
}

// =============================================================================
// Run Script
// =============================================================================

if (require.main === module) {
  seedVoices();
}

module.exports = { seedVoices, voices };
