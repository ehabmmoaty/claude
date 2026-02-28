/**
 * TranscriptViewer — Displays full conversation transcript with speaker labels,
 * timestamps, language indicators, and confidence scores.
 */

import { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import type { TranscriptSegment } from '../../shared/types';

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  highlightQuery?: string;
  onSegmentClick?: (segment: TranscriptSegment) => void;
}

function formatTimecode(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="rounded bg-yellow-200 px-0.5 dark:bg-yellow-800">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

// Group consecutive segments by same speaker
function groupSegments(segments: TranscriptSegment[]): TranscriptSegment[][] {
  const groups: TranscriptSegment[][] = [];
  let currentGroup: TranscriptSegment[] = [];

  for (const segment of segments) {
    if (
      currentGroup.length > 0 &&
      currentGroup[currentGroup.length - 1].speakerLabel !== segment.speakerLabel
    ) {
      groups.push(currentGroup);
      currentGroup = [];
    }
    currentGroup.push(segment);
  }

  if (currentGroup.length > 0) groups.push(currentGroup);
  return groups;
}

export function TranscriptViewer({
  segments,
  highlightQuery,
  onSegmentClick,
}: TranscriptViewerProps) {
  const intl = useIntl();
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to first highlighted match
  useEffect(() => {
    if (highlightQuery && containerRef.current) {
      const firstMark = containerRef.current.querySelector('mark');
      if (firstMark) {
        firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightQuery]);

  if (segments.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-12 text-sm text-gray-400">
        {intl.formatMessage({ id: 'conversations.noTranscript' })}
      </div>
    );
  }

  const groups = groupSegments(segments);

  return (
    <div ref={containerRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
      {groups.map((group) => {
        const firstSeg = group[0];
        const lastSeg = group[group.length - 1];
        const isArabic = firstSeg.language === 'ar';

        return (
          <div
            key={firstSeg.id}
            className="group flex gap-3"
          >
            {/* Timecode */}
            <div className="flex-shrink-0 pt-1">
              <span className="font-mono text-xs text-gray-400">
                {formatTimecode(firstSeg.startTime)}
              </span>
            </div>

            {/* Speaker block */}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {firstSeg.speakerLabel}
                </span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                    isArabic
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  }`}
                >
                  {isArabic ? 'AR' : 'EN'}
                </span>
                <span className="text-[10px] text-gray-400">
                  {formatTimecode(firstSeg.startTime)} – {formatTimecode(lastSeg.endTime)}
                </span>
              </div>

              {/* Segment texts */}
              <div
                className={`space-y-1 ${isArabic ? 'text-right' : 'text-left'}`}
                dir={isArabic ? 'rtl' : 'ltr'}
              >
                {group.map((segment) => (
                  <p
                    key={segment.id}
                    onClick={() => onSegmentClick?.(segment)}
                    className={`text-sm leading-relaxed text-gray-800 dark:text-gray-200 ${
                      onSegmentClick ? 'cursor-pointer rounded px-1 hover:bg-gray-100 dark:hover:bg-gray-800' : ''
                    }`}
                  >
                    {highlightQuery ? highlightText(segment.text, highlightQuery) : segment.text}
                    {segment.confidence < 0.7 && (
                      <span className="ms-1 text-[10px] text-amber-500" title="Low confidence">
                        ⚠
                      </span>
                    )}
                  </p>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
