'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VoiceSelector } from './voice-selector';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, FileAudio } from 'lucide-react';

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

interface GenerationSettings {
  speed: number;
  pitch: number;
  format: 'mp3' | 'wav' | 'ogg';
  quality: 'standard' | 'high' | 'premium';
}

interface GenerationFormProps {
  voices: Voice[];
  creditBalance: number;
  onGenerate: (
    text: string,
    voiceId: string,
    settings: GenerationSettings,
    projectId?: string
  ) => Promise<void>;
  projects?: Array<{ id: string; name: string }>;
  defaultVoiceId?: string;
  defaultText?: string;
}

export function GenerationForm({
  voices,
  creditBalance,
  onGenerate,
  projects = [],
  defaultVoiceId,
  defaultText = '',
}: GenerationFormProps) {
  const [text, setText] = useState(defaultText);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(
    voices.find((v) => v.id === defaultVoiceId) || null
  );
  const [projectId, setProjectId] = useState<string>('');
  const [settings, setSettings] = useState<GenerationSettings>({
    speed: 1.0,
    pitch: 1.0,
    format: 'mp3',
    quality: 'high',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const MAX_CHARS = 5000;
  const characterCount = text.length;
  const creditsRequired = Math.ceil(characterCount / 100);

  const canGenerate =
    text.trim().length > 0 &&
    selectedVoice !== null &&
    creditBalance >= creditsRequired &&
    !isGenerating;

  const handleGenerate = async () => {
    if (!canGenerate || !selectedVoice) return;

    setIsGenerating(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      await onGenerate(
        text,
        selectedVoice.id,
        settings,
        projectId || undefined
      );
      setProgress(100);
      // Reset form
      setText('');
      setSelectedVoice(null);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Text Input */}
      <Card className="border-white/10 p-4">
        <Label htmlFor="text-input" className="mb-2 block text-white">
          Enter your text
        </Label>
        <Textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder="Type or paste your text here..."
          className="min-h-[150px] resize-y"
          disabled={isGenerating}
        />
        <div className="mt-2 flex items-center justify-between">
          <span
            className={`text-sm ${
              characterCount > MAX_CHARS * 0.9
                ? 'text-orange-400'
                : 'text-white/60'
            }`}
          >
            {characterCount} / {MAX_CHARS} characters
          </span>
          <Badge variant="secondary">
            {creditsRequired} credit{creditsRequired !== 1 ? 's' : ''} required
          </Badge>
        </div>
      </Card>

      {/* Voice Selection */}
      <div>
        <Label className="mb-3 block text-white">Select Voice</Label>
        {selectedVoice ? (
          <Card className="mb-3 border-primary-500 bg-primary-500/10 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-white">
                  {selectedVoice.name}
                </h4>
                <p className="text-sm text-white/60">
                  {selectedVoice.gender} • {selectedVoice.age} •{' '}
                  {selectedVoice.accent}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedVoice(null)}
                disabled={isGenerating}
              >
                Change
              </Button>
            </div>
          </Card>
        ) : (
          <VoiceSelector
            voices={voices}
            selectedVoiceId={selectedVoice?.id}
            onSelectVoice={setSelectedVoice}
            compact
          />
        )}
      </div>

      {/* Settings */}
      {selectedVoice && (
        <Card className="border-white/10 p-4">
          <h3 className="mb-4 font-semibold text-white">
            Generation Settings
          </h3>

          <div className="space-y-4">
            {/* Speed */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-white/80">Speed</Label>
                <span className="text-sm text-white/60">{settings.speed}x</span>
              </div>
              <Slider
                value={[settings.speed]}
                onValueChange={(v) =>
                  setSettings({ ...settings, speed: v[0] })
                }
                min={0.5}
                max={2.0}
                step={0.1}
                disabled={isGenerating}
              />
            </div>

            {/* Pitch */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-white/80">Pitch</Label>
                <span className="text-sm text-white/60">{settings.pitch}x</span>
              </div>
              <Slider
                value={[settings.pitch]}
                onValueChange={(v) =>
                  setSettings({ ...settings, pitch: v[0] })
                }
                min={0.5}
                max={2.0}
                step={0.1}
                disabled={isGenerating}
              />
            </div>

            {/* Format */}
            <div>
              <Label className="mb-2 block text-white/80">Audio Format</Label>
              <Select
                value={settings.format}
                onValueChange={(v: any) =>
                  setSettings({ ...settings, format: v })
                }
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp3">MP3 (Recommended)</SelectItem>
                  <SelectItem value="wav">WAV (Lossless)</SelectItem>
                  <SelectItem value="ogg">OGG (Small Size)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quality */}
            <div>
              <Label className="mb-2 block text-white/80">Quality</Label>
              <Select
                value={settings.quality}
                onValueChange={(v: any) =>
                  setSettings({ ...settings, quality: v })
                }
                disabled={isGenerating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="high">High (Recommended)</SelectItem>
                  <SelectItem value="premium">Premium (+50% credits)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Project */}
            {projects.length > 0 && (
              <div>
                <Label className="mb-2 block text-white/80">
                  Add to Project (Optional)
                </Label>
                <Select
                  value={projectId}
                  onValueChange={setProjectId}
                  disabled={isGenerating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Generation Progress */}
      {isGenerating && (
        <Card className="border-white/10 p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium text-white">
                Generating your audio...
              </p>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </Card>
      )}

      {/* Generate Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/60">
          {creditBalance < creditsRequired ? (
            <span className="text-orange-400">
              Insufficient credits. You need {creditsRequired - creditBalance}{' '}
              more.
            </span>
          ) : (
            <span>
              Your balance: {creditBalance} credits (
              {creditsRequired} will be used)
            </span>
          )}
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="min-w-[200px]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Audio
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
