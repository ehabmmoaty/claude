import { useEffect, useRef } from 'react';
import { useRecordingStore } from '../stores/recordingStore';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function LiveTranscript() {
  const liveSegments = useRecordingStore((s) => s.liveSegments);
  const interimText = useRecordingStore((s) => s.interimText);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new segments arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [liveSegments, interimText]);

  if (liveSegments.length === 0 && !interimText) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Listening for speech...
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
      {liveSegments.map((segment) => (
        <div key={segment.id} className="flex gap-3">
          {/* Timecode */}
          <span className="shrink-0 pt-0.5 text-xs font-mono text-gray-400">
            {formatTime(segment.startTime)}
          </span>

          {/* Text */}
          <p
            className={`text-sm leading-relaxed ${
              segment.language === 'ar' ? 'text-right font-sans' : 'text-left'
            }`}
            dir={segment.language === 'ar' ? 'rtl' : 'ltr'}
          >
            {segment.text}
          </p>
        </div>
      ))}

      {/* Interim (partial) recognition */}
      {interimText && (
        <div className="flex gap-3">
          <span className="shrink-0 pt-0.5 text-xs font-mono text-gray-400">
            ··:··
          </span>
          <p className="text-sm leading-relaxed text-gray-400 italic">
            {interimText}
          </p>
        </div>
      )}
    </div>
  );
}
