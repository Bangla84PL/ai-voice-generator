'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, Pause, Heart, Search } from 'lucide-react';

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

interface VoiceSelectorProps {
  voices: Voice[];
  selectedVoiceId?: string;
  onSelectVoice: (voice: Voice) => void;
  showFavorites?: boolean;
  compact?: boolean;
}

export function VoiceSelector({
  voices,
  selectedVoiceId,
  onSelectVoice,
  showFavorites = false,
  compact = false,
}: VoiceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Get unique values for filters
  const languages = Array.from(new Set(voices.map((v) => v.language)));
  const providers = Array.from(new Set(voices.map((v) => v.provider)));

  // Filter voices
  const filteredVoices = voices.filter((voice) => {
    const matchesSearch =
      voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesGender =
      filterGender === 'all' || voice.gender === filterGender;
    const matchesLanguage =
      filterLanguage === 'all' || voice.language === filterLanguage;
    const matchesProvider =
      filterProvider === 'all' || voice.provider === filterProvider;
    const matchesFavorites =
      !showFavorites || favorites.has(voice.id);

    return (
      matchesSearch &&
      matchesGender &&
      matchesLanguage &&
      matchesProvider &&
      matchesFavorites
    );
  });

  // Handle voice preview
  const handlePreview = (voice: Voice) => {
    if (!voice.sample_url) return;

    if (playingVoiceId === voice.id && audio) {
      audio.pause();
      setPlayingVoiceId(null);
      return;
    }

    if (audio) {
      audio.pause();
    }

    const newAudio = new Audio(voice.sample_url);
    newAudio.addEventListener('ended', () => setPlayingVoiceId(null));
    newAudio.play();
    setAudio(newAudio);
    setPlayingVoiceId(voice.id);
  };

  // Toggle favorite
  const toggleFavorite = (voiceId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(voiceId)) {
        newFavorites.delete(voiceId);
      } else {
        newFavorites.add(voiceId);
      }
      // Store in localStorage
      localStorage.setItem(
        'favorite_voices',
        JSON.stringify(Array.from(newFavorites))
      );
      return newFavorites;
    });
  };

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('favorite_voices');
    if (stored) {
      setFavorites(new Set(JSON.parse(stored)));
    }
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
          <Input
            type="text"
            placeholder="Search voices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <Label className="text-xs text-white/80">Gender</Label>
            <Select value={filterGender} onValueChange={setFilterGender}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-white/80">Language</Label>
            <Select value={filterLanguage} onValueChange={setFilterLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-white/80">Provider</Label>
            <Select value={filterProvider} onValueChange={setFilterProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                {providers.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Voice Grid */}
      <div
        className={`grid gap-3 ${
          compact
            ? 'grid-cols-1'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {filteredVoices.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-white/60">No voices found matching your criteria</p>
          </div>
        ) : (
          filteredVoices.map((voice) => {
            const isSelected = selectedVoiceId === voice.id;
            const isPlaying = playingVoiceId === voice.id;
            const isFavorite = favorites.has(voice.id);

            return (
              <Card
                key={voice.id}
                className={`group relative cursor-pointer transition-all hover:border-primary-500/50 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-white/10'
                }`}
                onClick={() => onSelectVoice(voice)}
              >
                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">
                        {voice.name}
                      </h3>
                      <p className="text-xs text-white/60">
                        {voice.gender} • {voice.age} • {voice.accent}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(voice.id);
                      }}
                      className="text-white/40 transition-colors hover:text-red-400"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          isFavorite ? 'fill-red-400 text-red-400' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <p className="mb-3 line-clamp-2 text-sm text-white/70">
                    {voice.description}
                  </p>

                  <div className="mb-3 flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {voice.language}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {voice.provider}
                    </Badge>
                    {voice.is_premium && (
                      <Badge className="bg-gradient-to-r from-accent-warm to-orange-600 text-xs">
                        Premium
                      </Badge>
                    )}
                  </div>

                  {voice.sample_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(voice);
                      }}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Stop Preview
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Preview Voice
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Results count */}
      <div className="text-center text-sm text-white/60">
        Showing {filteredVoices.length} of {voices.length} voices
      </div>
    </div>
  );
}
