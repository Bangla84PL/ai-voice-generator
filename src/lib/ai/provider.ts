import {
  generateSpeech as openAIGenerateSpeech,
  generateSpeechStream as openAIGenerateSpeechStream,
  type GenerateSpeechOptions as OpenAIGenerateSpeechOptions,
  type GenerateSpeechResult as OpenAIGenerateSpeechResult,
  OPENAI_VOICES,
  type OpenAIVoice,
  type AudioFormat,
} from './openai';

// Provider types
export enum AIProvider {
  OPENAI = 'openai',
  ELEVENLABS = 'elevenlabs',
}

// Unified voice type that works across providers
export interface UnifiedVoice {
  id: string;
  name: string;
  provider: AIProvider;
  description?: string;
}

// Unified speech generation options
export interface UnifiedSpeechOptions {
  text: string;
  voiceId: string;
  format?: AudioFormat;
  speed?: number;
  stability?: number; // For ElevenLabs
  similarityBoost?: number; // For ElevenLabs
}

// Unified speech generation result
export interface UnifiedSpeechResult {
  audio: Buffer;
  format: AudioFormat;
  provider: AIProvider;
  voiceId: string;
  metadata?: Record<string, any>;
}

// Abstract provider interface
export interface IVoiceProvider {
  readonly name: AIProvider;
  generateSpeech(options: UnifiedSpeechOptions): Promise<UnifiedSpeechResult>;
  generateSpeechStream(options: UnifiedSpeechOptions): Promise<Response>;
  getAvailableVoices(): Promise<UnifiedVoice[]>;
  estimateCost(text: string): number;
}

// OpenAI Provider Implementation
export class OpenAIProvider implements IVoiceProvider {
  readonly name = AIProvider.OPENAI;

  async generateSpeech(
    options: UnifiedSpeechOptions
  ): Promise<UnifiedSpeechResult> {
    const { text, voiceId, format, speed } = options;

    // Validate voice
    if (!this.isValidVoice(voiceId)) {
      throw new Error(`Invalid OpenAI voice: ${voiceId}`);
    }

    const result = await openAIGenerateSpeech({
      text,
      voice: voiceId as OpenAIVoice,
      format,
      speed,
    });

    return {
      audio: result.audio,
      format: result.format,
      provider: AIProvider.OPENAI,
      voiceId: result.voice,
      metadata: {
        model: result.model,
      },
    };
  }

  async generateSpeechStream(
    options: UnifiedSpeechOptions
  ): Promise<Response> {
    const { text, voiceId, format, speed } = options;

    if (!this.isValidVoice(voiceId)) {
      throw new Error(`Invalid OpenAI voice: ${voiceId}`);
    }

    return openAIGenerateSpeechStream({
      text,
      voice: voiceId as OpenAIVoice,
      format,
      speed,
    });
  }

  async getAvailableVoices(): Promise<UnifiedVoice[]> {
    return Object.entries(OPENAI_VOICES).map(([key, id]) => ({
      id,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      provider: AIProvider.OPENAI,
      description: this.getVoiceDescription(id as OpenAIVoice),
    }));
  }

  estimateCost(text: string): number {
    // Using tts-1 model pricing: $0.015 per 1K characters
    return (text.length / 1000) * 0.015;
  }

  private isValidVoice(voice: string): boolean {
    return Object.values(OPENAI_VOICES).includes(voice as OpenAIVoice);
  }

  private getVoiceDescription(voice: OpenAIVoice): string {
    const descriptions: Record<OpenAIVoice, string> = {
      alloy: 'Neutral and balanced voice',
      echo: 'Clear and expressive voice',
      fable: 'Warm and friendly voice',
      onyx: 'Deep and authoritative voice',
      nova: 'Energetic and enthusiastic voice',
      shimmer: 'Soft and gentle voice',
    };
    return descriptions[voice];
  }
}

// ElevenLabs Provider Implementation (Stub for future implementation)
export class ElevenLabsProvider implements IVoiceProvider {
  readonly name = AIProvider.ELEVENLABS;

  async generateSpeech(
    options: UnifiedSpeechOptions
  ): Promise<UnifiedSpeechResult> {
    throw new Error('ElevenLabs provider not yet implemented');
  }

  async generateSpeechStream(
    options: UnifiedSpeechOptions
  ): Promise<Response> {
    throw new Error('ElevenLabs provider not yet implemented');
  }

  async getAvailableVoices(): Promise<UnifiedVoice[]> {
    throw new Error('ElevenLabs provider not yet implemented');
  }

  estimateCost(text: string): number {
    throw new Error('ElevenLabs provider not yet implemented');
  }
}

// Provider Factory
export class VoiceProviderFactory {
  private static providers: Map<AIProvider, IVoiceProvider> = new Map();

  /**
   * Get a provider instance
   * @param provider - The provider type
   * @returns Provider instance
   */
  static getProvider(provider: AIProvider): IVoiceProvider {
    // Return cached instance if available
    if (this.providers.has(provider)) {
      return this.providers.get(provider)!;
    }

    // Create new instance
    let providerInstance: IVoiceProvider;

    switch (provider) {
      case AIProvider.OPENAI:
        providerInstance = new OpenAIProvider();
        break;
      case AIProvider.ELEVENLABS:
        providerInstance = new ElevenLabsProvider();
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    // Cache and return
    this.providers.set(provider, providerInstance);
    return providerInstance;
  }

  /**
   * Get the default provider based on environment variables
   * @returns Default provider instance
   */
  static getDefaultProvider(): IVoiceProvider {
    const defaultProvider =
      (process.env.DEFAULT_AI_PROVIDER as AIProvider) || AIProvider.OPENAI;

    return this.getProvider(defaultProvider);
  }

  /**
   * Clear provider cache (useful for testing)
   */
  static clearCache(): void {
    this.providers.clear();
  }
}

// Convenience functions using the default provider
export async function generateSpeech(
  options: UnifiedSpeechOptions
): Promise<UnifiedSpeechResult> {
  const provider = VoiceProviderFactory.getDefaultProvider();
  return provider.generateSpeech(options);
}

export async function generateSpeechStream(
  options: UnifiedSpeechOptions
): Promise<Response> {
  const provider = VoiceProviderFactory.getDefaultProvider();
  return provider.generateSpeechStream(options);
}

export async function getAvailableVoices(
  providerType?: AIProvider
): Promise<UnifiedVoice[]> {
  const provider = providerType
    ? VoiceProviderFactory.getProvider(providerType)
    : VoiceProviderFactory.getDefaultProvider();

  return provider.getAvailableVoices();
}

export function estimateCost(text: string, providerType?: AIProvider): number {
  const provider = providerType
    ? VoiceProviderFactory.getProvider(providerType)
    : VoiceProviderFactory.getDefaultProvider();

  return provider.estimateCost(text);
}

// Export types and constants
export type { OpenAIVoice, AudioFormat };
export { OPENAI_VOICES };
