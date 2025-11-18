'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GenerationForm } from '@/components/voice/generation-form';
import { WaveformVisualizer } from '@/components/voice/waveform-visualizer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Download, History } from 'lucide-react';
import Link from 'next/link';

interface Voice {
  id: string;
  name: string;
  provider: 'openai' | 'elevenlabs' | 'azure';
  gender: 'male' | 'female' | 'neutral';
  age: 'young' | 'adult' | 'senior';
  accent: string;
  language: string;
  description: string;
  sample_url: string | null;
  is_premium: boolean;
  tags: string[];
}

interface GenerateClientProps {
  creditBalance: number;
  voices: Voice[];
  projects: Array<{ id: string; name: string }>;
}

interface GenerationResult {
  id: string;
  audio_url: string;
  text: string;
  credits_used: number;
  audio_duration: number | null;
}

export function GenerateClient({ creditBalance, voices, projects }: GenerateClientProps) {
  const router = useRouter();
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (
    text: string,
    voiceId: string,
    settings: any,
    projectId?: string
  ) => {
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice_id: voiceId,
          settings,
          project_id: projectId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Generation failed');
      }

      const data = await response.json();
      setResult(data.generation);

      // Refresh the page to update credit balance
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      throw err;
    }
  };

  const handleDownload = async () => {
    if (!result?.audio_url) return;

    try {
      const response = await fetch(result.audio_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voice-generation-${result.id}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">
            Generate Voice
          </h1>
          <p className="text-white/70">
            Convert your text to natural-sounding speech
          </p>
        </div>
        <Link href="/dashboard/history">
          <Button variant="outline">
            <History className="mr-2 h-4 w-4" />
            View History
          </Button>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-500/50 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
            <div>
              <h3 className="font-semibold text-red-400">Generation Failed</h3>
              <p className="mt-1 text-sm text-red-300">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Success Result */}
      {result && (
        <Card className="border-green-500/50 bg-green-500/10 p-6">
          <div className="mb-4 flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-400" />
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold text-green-400">
                Generation Successful!
              </h3>
              <p className="text-sm text-green-300">
                Your audio has been generated and is ready to download
              </p>
              <div className="mt-2 flex gap-2">
                <Badge variant="secondary">
                  {result.credits_used} credits used
                </Badge>
                {result.audio_duration && (
                  <Badge variant="outline">
                    {Math.round(result.audio_duration)}s duration
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Waveform Player */}
          <WaveformVisualizer
            audioUrl={result.audio_url}
            title="Generated Audio"
            onDownload={handleDownload}
            showDownload={true}
          />

          {/* Actions */}
          <div className="mt-4 flex gap-3">
            <Button variant="primary" onClick={handleDownload} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download Audio
            </Button>
            <Button
              variant="outline"
              onClick={() => setResult(null)}
              className="flex-1"
            >
              Generate Another
            </Button>
          </div>
        </Card>
      )}

      {/* Generation Form */}
      {!result && (
        <GenerationForm
          voices={voices}
          creditBalance={creditBalance}
          onGenerate={handleGenerate}
          projects={projects}
        />
      )}

      {/* Info Card */}
      <Card className="border-white/10 bg-white/5 p-4">
        <h3 className="mb-2 font-semibold text-white">Tips for Best Results</h3>
        <ul className="space-y-1 text-sm text-white/70">
          <li>• Use proper punctuation for natural pauses</li>
          <li>• Spell out abbreviations and numbers</li>
          <li>• Preview different voices to find the perfect match</li>
          <li>• Adjust speed and pitch for custom results</li>
          <li>• Premium quality uses more credits but sounds better</li>
        </ul>
      </Card>
    </div>
  );
}
