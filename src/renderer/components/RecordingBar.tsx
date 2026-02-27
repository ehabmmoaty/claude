import { useIntl } from 'react-intl';
import { useAppStore } from '../stores/appStore';
import { electron } from '../lib/electron';
import { Mic, MicOff, Pause, Play, ShieldAlert } from 'lucide-react';

export function RecordingBar() {
  const intl = useIntl();
  const recordingState = useAppStore((s) => s.recordingState);
  const setRecordingState = useAppStore((s) => s.setRecordingState);

  const handleToggleRecording = () => {
    if (recordingState === 'recording') {
      electron?.stopRecording();
      setRecordingState('idle');
      electron?.updateTrayState('idle');
    } else {
      electron?.startRecording();
      setRecordingState('recording');
      electron?.updateTrayState('recording');
    }
  };

  const handlePause = () => {
    if (recordingState === 'paused') {
      electron?.startRecording();
      setRecordingState('recording');
      electron?.updateTrayState('recording');
    } else {
      electron?.pauseRecording();
      setRecordingState('paused');
      electron?.updateTrayState('paused');
    }
  };

  const handlePrivacyPause = () => {
    electron?.privacyPause();
    setRecordingState('privacy_pause');
    electron?.updateTrayState('privacy_pause');
  };

  const isRecording = recordingState === 'recording';
  const isPaused = recordingState === 'paused';
  const isPrivacy = recordingState === 'privacy_pause';

  return (
    <footer className="flex h-14 items-center justify-between border-t border-gray-200 bg-surface-light px-4 dark:border-gray-700 dark:bg-surface-dark">
      {/* Status text */}
      <div className="flex items-center gap-2 text-sm">
        {isRecording && (
          <>
            <span className="recording-pulse h-2 w-2 rounded-full bg-red-500" />
            <span className="text-red-600 dark:text-red-400">
              {intl.formatMessage({ id: 'recording.active' })}
            </span>
          </>
        )}
        {isPaused && (
          <span className="text-yellow-600 dark:text-yellow-400">
            {intl.formatMessage({ id: 'recording.paused' })}
          </span>
        )}
        {isPrivacy && (
          <>
            <ShieldAlert className="h-4 w-4 text-yellow-600" />
            <span className="text-yellow-600 dark:text-yellow-400">
              {intl.formatMessage({ id: 'recording.privacyActive' })}
            </span>
          </>
        )}
        {recordingState === 'idle' && (
          <span className="text-gray-500">
            {intl.formatMessage({ id: 'recording.idle' })}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Privacy Pause */}
        {(isRecording || isPaused) && (
          <button
            onClick={handlePrivacyPause}
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
            isRecording || isPaused
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-brand-600 text-white hover:bg-brand-700'
          }`}
          aria-label={
            isRecording || isPaused
              ? intl.formatMessage({ id: 'recording.stop' })
              : intl.formatMessage({ id: 'recording.start' })
          }
        >
          {isRecording || isPaused ? (
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
