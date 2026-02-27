import { useState } from 'react';
import { useIntl } from 'react-intl';
import { useRecordingStore } from '../stores/recordingStore';
import { WaveformVisualizer } from './WaveformVisualizer';
import { Mic, MicOff, Pause, Play, ShieldAlert, Monitor } from 'lucide-react';
import type { AudioSource } from '../../shared/types';

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function RecordingBar() {
  const intl = useIntl();
  const recordingState = useRecordingStore((s) => s.recordingState);
  const elapsedSeconds = useRecordingStore((s) => s.elapsedSeconds);
  const startRecording = useRecordingStore((s) => s.startRecording);
  const stopRecording = useRecordingStore((s) => s.stopRecording);
  const pauseRecording = useRecordingStore((s) => s.pauseRecording);
  const resumeRecording = useRecordingStore((s) => s.resumeRecording);
  const triggerPrivacyPause = useRecordingStore((s) => s.triggerPrivacyPause);
  const [showSourceMenu, setShowSourceMenu] = useState(false);

  const handleStartWithSource = async (source: AudioSource) => {
    setShowSourceMenu(false);
    await startRecording(source);
  };

  const handleToggleRecording = async () => {
    if (recordingState === 'recording' || recordingState === 'paused') {
      await stopRecording();
    } else {
      await startRecording('microphone');
    }
  };

  const handlePause = () => {
    if (recordingState === 'paused') {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };

  const isRecording = recordingState === 'recording';
  const isPaused = recordingState === 'paused';
  const isPrivacy = recordingState === 'privacy_pause';
  const isActive = isRecording || isPaused;

  return (
    <footer className="flex h-14 items-center justify-between border-t border-gray-200 bg-surface-light px-4 dark:border-gray-700 dark:bg-surface-dark">
      {/* Left: Status + waveform */}
      <div className="flex items-center gap-3">
        {isRecording && (
          <>
            <span className="recording-pulse h-2 w-2 rounded-full bg-red-500" />
            <span className="text-xs font-medium tabular-nums text-red-600 dark:text-red-400">
              {formatElapsed(elapsedSeconds)}
            </span>
            <WaveformVisualizer width={120} height={24} barColor="#ef4444" />
          </>
        )}
        {isPaused && (
          <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
            {intl.formatMessage({ id: 'recording.paused' })} · {formatElapsed(elapsedSeconds)}
          </span>
        )}
        {isPrivacy && (
          <>
            <ShieldAlert className="h-4 w-4 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
              {intl.formatMessage({ id: 'recording.privacyActive' })}
            </span>
          </>
        )}
        {recordingState === 'idle' && (
          <span className="text-xs text-gray-500">
            {intl.formatMessage({ id: 'recording.idle' })}
          </span>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Audio source selector (only when idle) */}
        {!isActive && !isPrivacy && (
          <div className="relative">
            <button
              onClick={() => setShowSourceMenu(!showSourceMenu)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Select audio source"
              aria-label="Select audio source"
            >
              <Monitor className="h-4 w-4" />
            </button>
            {showSourceMenu && (
              <div className="absolute bottom-full end-0 mb-1 w-48 rounded-lg border border-gray-200 bg-surface-light p-1 shadow-lg dark:border-gray-700 dark:bg-surface-dark">
                <button
                  onClick={() => handleStartWithSource('microphone')}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Mic className="h-4 w-4" /> Microphone
                </button>
                <button
                  onClick={() => handleStartWithSource('system')}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Monitor className="h-4 w-4" /> System Audio
                </button>
                <button
                  onClick={() => handleStartWithSource('both')}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Mic className="h-4 w-4" />+<Monitor className="h-3 w-3" /> Both
                </button>
              </div>
            )}
          </div>
        )}

        {/* Privacy Pause */}
        {isActive && (
          <button
            onClick={triggerPrivacyPause}
            className="rounded-lg p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30"
            title={intl.formatMessage({ id: 'recording.privacyPause' })}
            aria-label={intl.formatMessage({ id: 'recording.privacyPause' })}
          >
            <ShieldAlert className="h-5 w-5" />
          </button>
        )}

        {/* Pause/Resume */}
        {isRecording && (
          <button
            onClick={handlePause}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            title={intl.formatMessage({ id: 'recording.pause' })}
            aria-label={intl.formatMessage({ id: 'recording.pause' })}
          >
            <Pause className="h-5 w-5" />
          </button>
        )}
        {isPaused && (
          <button
            onClick={handlePause}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            title={intl.formatMessage({ id: 'recording.resume' })}
            aria-label={intl.formatMessage({ id: 'recording.resume' })}
          >
            <Play className="h-5 w-5" />
          </button>
        )}

        {/* Start/Stop Recording */}
        <button
          onClick={handleToggleRecording}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            isActive
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-brand-600 text-white hover:bg-brand-700'
          }`}
          aria-label={
            isActive
              ? intl.formatMessage({ id: 'recording.stop' })
              : intl.formatMessage({ id: 'recording.start' })
          }
        >
          {isActive ? (
            <>
              <MicOff className="h-4 w-4" />
              {intl.formatMessage({ id: 'recording.stop' })}
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              {intl.formatMessage({ id: 'recording.start' })}
            </>
          )}
        </button>
      </div>
    </footer>
  );
}
