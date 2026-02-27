import { useEffect, useRef } from 'react';
import { useRecordingStore } from '../stores/recordingStore';

interface WaveformVisualizerProps {
  width?: number;
  height?: number;
  barColor?: string;
  className?: string;
}

export function WaveformVisualizer({
  width = 200,
  height = 32,
  barColor = '#0c93e7',
  className = '',
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioLevelHistory = useRecordingStore((s) => s.audioLevelHistory);
  const recordingState = useRecordingStore((s) => s.recordingState);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, width, height);

    const isActive = recordingState === 'recording';
    const barCount = audioLevelHistory.length;
    const barWidth = Math.max(1, (width / barCount) * 0.7);
    const gap = (width / barCount) * 0.3;
    const centerY = height / 2;

    for (let i = 0; i < barCount; i++) {
      const level = audioLevelHistory[i];
      const barHeight = Math.max(2, level * (height - 4));

      const x = i * (barWidth + gap);
      const y = centerY - barHeight / 2;

      // Color based on state
      if (isActive) {
        const alpha = 0.4 + level * 0.6;
        ctx.fillStyle = barColor.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
        if (!barColor.startsWith('rgb')) {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = barColor;
        }
      } else {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#9ca3af';
      }

      // Draw rounded bar
      const radius = Math.min(barWidth / 2, 2);
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, radius);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }, [audioLevelHistory, recordingState, width, height, barColor]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width, height }}
      aria-label="Audio waveform visualization"
      role="img"
    />
  );
}
