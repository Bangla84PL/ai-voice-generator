'use client';

import { useState } from 'next/navigation';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AudioPlayer } from '@/components/voice/audio-player';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import {
  Download,
  Trash2,
  Play,
  Clock,
  FileAudio,
  ChevronLeft,
  ChevronRight,
  Filter,
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
  project: {
    name: string;
  } | null;
}

interface HistoryClientProps {
  generations: Generation[];
  voices: Array<{ id: string; name: string }>;
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export function HistoryClient({
  generations,
  voices,
  totalCount,
  currentPage,
  pageSize,
}: HistoryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [generationToDelete, setGenerationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const totalPages = Math.ceil(totalCount / pageSize);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all' || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page'); // Reset to first page when filtering
    router.push(`/dashboard/history?${params.toString()}`);
  };

  const changePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/dashboard/history?${params.toString()}`);
  };

  const handleDownload = async (generation: Generation) => {
    if (!generation.audio_url) return;

    try {
      const response = await fetch(generation.audio_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voice-generation-${generation.id}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!generationToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/generations/${generationToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete generation');
      }

      // Refresh the page
      router.refresh();
      setDeleteDialogOpen(false);
      setGenerationToDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
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
      {/* Page Header */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-white">
          Generation History
        </h1>
        <p className="text-white/70">
          View and manage your {totalCount} voice generations
        </p>
      </div>

      {/* Filters */}
      <Card className="border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-white/60" />
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <Select
              value={searchParams.get('status') || 'all'}
              onValueChange={(value) => updateFilters('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={searchParams.get('voice') || 'all'}
              onValueChange={(value) => updateFilters('voice', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Voices</SelectItem>
                {voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Generations List */}
      {generations.length === 0 ? (
        <Card className="border-white/10 p-12 text-center">
          <FileAudio className="mx-auto mb-3 h-12 w-12 text-white/30" />
          <p className="mb-2 text-white/70">No generations found</p>
          <p className="text-sm text-white/50">
            Try adjusting your filters or create a new generation
          </p>
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
                    {generation.project && (
                      <Badge variant="outline" className="text-xs">
                        {generation.project.name}
                      </Badge>
                    )}
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
                  {generation.status === 'completed' && generation.audio_url && (
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setGenerationToDelete(generation.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount}{' '}
            generations
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => changePage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Generation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this generation? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
