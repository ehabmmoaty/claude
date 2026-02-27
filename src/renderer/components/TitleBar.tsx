import { useRecordingStore } from '../stores/recordingStore';

export function TitleBar() {
  const recordingState = useRecordingStore((s) => s.recordingState);

  return (
    <header className="drag-region flex h-12 items-center justify-between border-b border-gray-200 bg-surface-light px-4 dark:border-gray-700 dark:bg-surface-dark">
      {/* macOS traffic light spacer */}
      <div className="w-20" />

      {/* Center: Recording status */}
      <div className="no-drag flex items-center gap-2">
        {recordingState === 'recording' && (
          <div className="flex items-center gap-2">
            <span className="recording-pulse h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-xs font-medium text-red-600 dark:text-red-400">REC</span>
          </div>
        )}
        {recordingState === 'privacy_pause' && (
          <div className="privacy-shield flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 dark:bg-yellow-900">
            <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
              Privacy Pause
            </span>
          </div>
        )}
        {recordingState === 'listening' && (
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Listening
            </span>
          </div>
        )}
      </div>

      {/* Right spacer */}
      <div className="w-20" />
    </header>
  );
}
