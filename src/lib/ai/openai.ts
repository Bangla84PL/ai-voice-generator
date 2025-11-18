import OpenAI from 'openai';
import type { Readable } from 'stream';

// Environment variable validation
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

// OpenAI client initialization
export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Available OpenAI TTS voices
export const OPENAI_VOICES = {
  alloy: 'alloy',
  echo: 'echo',
  fable: 'fable',
  onyx: 'onyx',
  nova: 'nova',
  shimmer: 'shimmer',
} as const;

export type OpenAIVoice = typeof OPENAI_VOICES[keyof typeof OPENAI_VOICES];

// Available TTS models
export const OPENAI_TTS_MODELS = {
  tts1: 'tts-1',
  tts1hd: 'tts-1-hd',
} as const;

export type OpenAITTSModel = typeof OPENAI_TTS_MODELS[keyof typeof OPENAI_TTS_MODELS];

// Audio format options
export const AUDIO_FORMATS = {
  mp3: 'mp3',
  opus: 'opus',
  aac: 'aac',
  flac: 'flac',
} as const;

export type AudioFormat = typeof AUDIO_FORMATS[keyof typeof AUDIO_FORMATS];

// Speech generation options
export interface GenerateSpeechOptions {
  text: string;
  voice?: OpenAIVoice;
  model?: OpenAITTSModel;
  format?: AudioFormat;
  speed?: number; // 0.25 to 4.0
}

// Speech generation result
export interface GenerateSpeechResult {
  audio: Buffer;
  format: AudioFormat;
  voice: OpenAIVoice;
  model: OpenAITTSModel;
}

// Error types
export class OpenAITTSError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'OpenAITTSError';
  }
}

/**
 * Generate speech from text using OpenAI TTS API
 * @param options - Speech generation options
 * @returns Buffer containing the audio data
 */
export async function generateSpeech(
  options: GenerateSpeechOptions
): Promise<GenerateSpeechResult> {
  const {
    text,
    voice = OPENAI_VOICES.alloy,
    model = OPENAI_TTS_MODELS.tts1,
    format = AUDIO_FORMATS.mp3,
    speed = 1.0,
  } = options;

  // Validate inputs
  if (!text || text.trim().length === 0) {
    throw new OpenAITTSError('Text cannot be empty', 'INVALID_INPUT');
  }

  if (text.length > 4096) {
    throw new OpenAITTSError(
      'Text exceeds maximum length of 4096 characters',
      'TEXT_TOO_LONG'
    );
  }

  if (speed < 0.25 || speed > 4.0) {
    throw new OpenAITTSError(
      'Speed must be between 0.25 and 4.0',
      'INVALID_SPEED'
    );
  }

  if (!Object.values(OPENAI_VOICES).includes(voice)) {
    throw new OpenAITTSError(`Invalid voice: ${voice}`, 'INVALID_VOICE');
  }

  if (!Object.values(AUDIO_FORMATS).includes(format)) {
    throw new OpenAITTSError(`Invalid format: ${format}`, 'INVALID_FORMAT');
  }

  try {
    const response = await openai.audio.speech.create({
      model,
      voice,
      input: text,
      response_format: format,
      speed,
    });

    // Convert response to buffer
    const buffer = Buffer.from(await response.arrayBuffer());

    return {
      audio: buffer,
      format,
      voice,
      model,
    };
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new OpenAITTSError(
        `OpenAI API error: ${error.message}`,
        error.code || 'API_ERROR',
        error.status
      );
    }

    if (error instanceof Error) {
      throw new OpenAITTSError(
        `Speech generation failed: ${error.message}`,
        'GENERATION_FAILED'
      );
    }

    throw new OpenAITTSError(
      'Unknown error occurred during speech generation',
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Generate speech with streaming support
 * @param options - Speech generation options
 * @returns Readable stream containing the audio data
 */
export async function generateSpeechStream(
  options: GenerateSpeechOptions
): Promise<Response> {
  const {
    text,
    voice = OPENAI_VOICES.alloy,
    model = OPENAI_TTS_MODELS.tts1,
    format = AUDIO_FORMATS.mp3,
    speed = 1.0,
  } = options;

  // Validate inputs (same as generateSpeech)
  if (!text || text.trim().length === 0) {
    throw new OpenAITTSError('Text cannot be empty', 'INVALID_INPUT');
  }

  if (text.length > 4096) {
    throw new OpenAITTSError(
      'Text exceeds maximum length of 4096 characters',
      'TEXT_TOO_LONG'
    );
  }

  if (speed < 0.25 || speed > 4.0) {
    throw new OpenAITTSError(
      'Speed must be between 0.25 and 4.0',
      'INVALID_SPEED'
    );
  }

  try {
    const response = await openai.audio.speech.create({
      model,
      voice,
      input: text,
      response_format: format,
      speed,
    });

    return response;
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new OpenAITTSError(
        `OpenAI API error: ${error.message}`,
        error.code || 'API_ERROR',
        error.status
      );
    }

    if (error instanceof Error) {
      throw new OpenAITTSError(
        `Speech generation failed: ${error.message}`,
        'GENERATION_FAILED'
      );
    }

    throw new OpenAITTSError(
      'Unknown error occurred during speech generation',
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Estimate the cost of generating speech
 * @param text - The text to generate speech from
 * @param model - The TTS model to use
 * @returns Estimated cost in USD
 */
export function estimateCost(text: string, model: OpenAITTSModel): number {
  const characterCount = text.length;

  // OpenAI pricing (as of 2024):
  // tts-1: $0.015 per 1K characters
  // tts-1-hd: $0.030 per 1K characters
  const pricePerThousandChars = model === OPENAI_TTS_MODELS.tts1hd ? 0.030 : 0.015;

  return (characterCount / 1000) * pricePerThousandChars;
}

/**
 * Validate if a voice is supported
 * @param voice - The voice to validate
 * @returns True if the voice is supported
 */
export function isValidVoice(voice: string): voice is OpenAIVoice {
  return Object.values(OPENAI_VOICES).includes(voice as OpenAIVoice);
}

/**
 * Get voice description
 * @param voice - The voice to get description for
 * @returns Description of the voice
 */
export function getVoiceDescription(voice: OpenAIVoice): string {
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
