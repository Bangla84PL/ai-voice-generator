'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VoiceSelector } from '@/components/voice/voice-selector';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Heart, TrendingUp } from 'lucide-react';
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

interface LibraryClientProps {
  voices: Voice[];
}

export function LibraryClient({ voices }: LibraryClientProps) {
  const router = useRouter();
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const handleSelectVoice = (voice: Voice) => {
    setSelectedVoice(voice);
  };

  const handleUseVoice = () => {
    if (selectedVoice) {
      // Navigate to generate page with selected voice
      router.push(`/dashboard/generate?voice=${selectedVoice.id}`);
    }
  };

  // Group voices by category
  const premiumVoices = voices.filter((v) => v.is_premium);
  const popularVoices = voices.slice(0, 12); // This should ideally come from usage stats

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-white">Voice Library</h1>
          <p className="text-white/70">
            Explore our collection of {voices.length} AI voices
          </p>
        </div>
        {selectedVoice && (
          <Button variant="primary" onClick={handleUseVoice}>
            <Sparkles className="mr-2 h-4 w-4" />
            Use This Voice
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-500/20 p-2">
              <Sparkles className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{voices.length}</p>
              <p className="text-sm text-white/60">Total Voices</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/20 p-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{premiumVoices.length}</p>
              <p className="text-sm text-white/60">Premium Voices</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-pink-500/20 p-2">
              <Heart className="h-5 w-5 text-pink-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {new Set(voices.map((v) => v.language)).size}
              </p>
              <p className="text-sm text-white/60">Languages</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Selected Voice Details */}
      {selectedVoice && (
        <Card className="border-primary-500 bg-primary-500/10 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">
                  {selectedVoice.name}
                </h2>
                {selectedVoice.is_premium && (
                  <Badge className="bg-gradient-to-r from-accent-warm to-orange-600">
                    Premium
                  </Badge>
                )}
              </div>
              <p className="mb-3 text-white/70">{selectedVoice.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{selectedVoice.language}</Badge>
                <Badge variant="outline">{selectedVoice.provider}</Badge>
                <Badge variant="outline">
                  {selectedVoice.gender} • {selectedVoice.age}
                </Badge>
                <Badge variant="outline">{selectedVoice.accent}</Badge>
              </div>
            </div>
            <Button variant="primary" onClick={handleUseVoice}>
              <Sparkles className="mr-2 h-4 w-4" />
              Use This Voice
            </Button>
          </div>
        </Card>
      )}

      {/* Voice Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Voices</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <VoiceSelector
            voices={voices}
            selectedVoiceId={selectedVoice?.id}
            onSelectVoice={handleSelectVoice}
          />
        </TabsContent>

        <TabsContent value="popular" className="mt-6">
          <VoiceSelector
            voices={popularVoices}
            selectedVoiceId={selectedVoice?.id}
            onSelectVoice={handleSelectVoice}
          />
        </TabsContent>

        <TabsContent value="premium" className="mt-6">
          <VoiceSelector
            voices={premiumVoices}
            selectedVoiceId={selectedVoice?.id}
            onSelectVoice={handleSelectVoice}
          />
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="border-white/10 bg-white/5 p-4">
        <h3 className="mb-2 font-semibold text-white">About Our Voices</h3>
        <div className="space-y-2 text-sm text-white/70">
          <p>
            Our voice library features high-quality AI voices from leading
            providers including OpenAI, ElevenLabs, and Azure.
          </p>
          <p>
            Premium voices offer enhanced quality and natural intonation, perfect
            for professional projects.
          </p>
          <p>
            Click the preview button on any voice card to hear a sample before
            using it in your generation.
          </p>
        </div>
      </Card>
    </div>
  );
}
