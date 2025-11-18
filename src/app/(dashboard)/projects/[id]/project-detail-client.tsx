'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AudioPlayer } from '@/components/voice/audio-player';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Sparkles,
  FileAudio,
  Clock,
  Coins,
  Download,
  Play,
  Trash2,
  Package,
} from 'lucide-react';

interface Generation {
  id: string;
  text: string;
  character_count: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  audio_url: string | null;
  audio_duration: number | null;
  credits_used: number;
  error_message: string | null;
  created_at: string;
  voice: {
    name: string;
    provider: string;
    gender: string;
  } | null;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface ProjectDetailClientProps {
  project: Project;
  generations: Generation[];
  stats: {
    totalGenerations: number;
    totalCreditsUsed: number;
    totalDuration: number;
    completedGenerations: number;
  };
}

export function ProjectDetailClient({
  project,
  generations,
  stats,
}: ProjectDetailClientProps) {
  const router = useRouter();
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(
    null
  );

  const handleDownload = async (generation: Generation) => {
    if (!generation.audio_url) return;

    try {
      const response = await fetch(generation.audio_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name}-${generation.id}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleExportProject = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/export`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name}-export.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/projects">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </Link>

      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="mb-2 text-3xl font-bold text-white">{project.name}</h1>
          {project.description && (
            <p className="text-white/70">{project.description}</p>
          )}
          <p className="mt-2 text-sm text-white/50">
            Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/generate?project=${project.id}`}>
            <Button variant="primary">
              <Sparkles className="mr-2 h-4 w-4" />
              Add Generation
            </Button>
          </Link>
          <Button variant="outline" onClick={handleExportProject}>
            <Package className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-500/20 p-2">
              <FileAudio className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats.totalGenerations}
              </p>
              <p className="text-sm text-white/60">Total</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/20 p-2">
              <FileAudio className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats.completedGenerations}
              </p>
              <p className="text-sm text-white/60">Completed</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/20 p-2">
              <Coins className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats.totalCreditsUsed}
              </p>
              <p className="text-sm text-white/60">Credits Used</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {Math.round(stats.totalDuration)}s
              </p>
              <p className="text-sm text-white/60">Total Audio</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Generations List */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-white">
          Generations ({generations.length})
        </h2>

        {generations.length === 0 ? (
          <Card className="border-white/10 p-12 text-center">
            <FileAudio className="mx-auto mb-3 h-12 w-12 text-white/30" />
            <p className="mb-2 text-white/70">No generations yet</p>
            <p className="mb-4 text-sm text-white/50">
              Add your first generation to this project
            </p>
            <Link href={`/dashboard/generate?project=${project.id}`}>
              <Button variant="primary">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Now
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {generations.map((generation) => (
              <Card
                key={generation.id}
                className="border-white/10 p-4 transition-all hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    {/* Status and metadata */}
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant={getStatusColor(generation.status)}>
                        {generation.status}
                      </Badge>
                      <span className="text-sm text-white/60">
                        {generation.voice?.name || 'Unknown Voice'}
                      </span>
                    </div>

                    {/* Text preview */}
                    <p className="mb-2 line-clamp-2 text-sm text-white/80">
                      {generation.text}
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-white/60">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(generation.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      <span>{generation.character_count} characters</span>
                      <span>{generation.credits_used} credits</span>
                      {generation.audio_duration && (
                        <span>{Math.round(generation.audio_duration)}s</span>
                      )}
                    </div>

                    {/* Error message */}
                    {generation.error_message && (
                      <p className="mt-2 text-sm text-red-400">
                        Error: {generation.error_message}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-shrink-0 items-start gap-2">
                    {generation.status === 'completed' &&
                      generation.audio_url && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedGeneration(generation)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(generation)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Audio Player Dialog */}
      <Dialog
        open={!!selectedGeneration}
        onOpenChange={(open) => !open && setSelectedGeneration(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Play Audio</DialogTitle>
            <DialogDescription>
              {selectedGeneration?.voice?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedGeneration?.audio_url && (
            <AudioPlayer
              audioUrl={selectedGeneration.audio_url}
              title={selectedGeneration.text.slice(0, 100)}
              onDownload={() => handleDownload(selectedGeneration)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
