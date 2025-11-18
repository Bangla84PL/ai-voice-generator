'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Download } from 'lucide-react';

interface WaveformVisualizerProps {
  audioUrl: string;
  title?: string;
  onDownload?: () => void;
  showDownload?: boolean;
  height?: number;
  waveColor?: string;
  progressColor?: string;
  className?: string;
}

export function WaveformVisualizer({
  audioUrl,
  title,
  onDownload,
  showDownload = true,
  height = 128,
  waveColor = 'rgba(139, 92, 246, 0.3)',
  progressColor = '#8b5cf6',
  className = '',
}: WaveformVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Format time in mm:ss
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    let wavesurfer: any;

    // Dynamically import WaveSurfer (client-side only)
    import('wavesurfer.js').then((WaveSurfer) => {
      wavesurfer = WaveSurfer.default.create({
        container: containerRef.current!,
        waveColor,
        progressColor,
        cursorColor: progressColor,
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 2,
        height,
        barGap: 2,
        responsive: true,
        normalize: true,
        partialRender: true,
      });

      wavesurferRef.current = wavesurfer;

      // Load audio
      wavesurfer.load(audioUrl);

      // Event listeners
      wavesurfer.on('ready', () => {
        setIsReady(true);
        setDuration(wavesurfer.getDuration());
      });

      wavesurfer.on('play', () => setIsPlaying(true));
      wavesurfer.on('pause', () => setIsPlaying(false));

      wavesurfer.on('audioprocess', () => {
        setCurrentTime(wavesurfer.getCurrentTime());
      });

      wavesurfer.on('seek', () => {
        setCurrentTime(wavesurfer.getCurrentTime());
      });

      wavesurfer.on('finish', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
    });

    // Cleanup
    return () => {
      if (wavesurfer) {
        wavesurfer.destroy();
      }
    };
  }, [audioUrl, height, waveColor, progressColor]);

  const handlePlayPause = () => {
    if (!wavesurferRef.current || !isReady) return;
    wavesurferRef.current.playPause();
  };

  return (
    <Card className={`border-white/10 p-4 ${className}`}>
      {/* Title */}
      {title && (
        <div className="mb-3">
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
      )}

      {/* Waveform Container */}
      <div className="mb-3">
        <div
          ref={containerRef}
          className="overflow-hidden rounded-lg bg-black/20"
        />
      </div>

      {/* Time Display */}
      <div className="mb-3 flex justify-between text-xs text-white/60">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <Button
            variant="primary"
            size="icon"
            onClick={handlePlayPause}
            disabled={!isReady}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          {!isReady && (
            <span className="text-sm text-white/60">Loading waveform...</span>
          )}
        </div>

        {/* Download Button */}
        {showDownload && onDownload && (
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        )}
      </div>
    </Card>
  );
}
