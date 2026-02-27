/**
 * Recording Store — Orchestrates audio capture + transcription
 *
 * Manages the full recording lifecycle: start/stop/pause/privacy-pause,
 * audio level monitoring, live transcript accumulation, and session persistence.
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  startCapture,
  stopCapture,
  pauseCapture,
  resumeCapture,
  privacyPause as audioPrivacyPause,
  onAudioData,
  onAudioLevel,
} from '../services/audioService';
import {
  startTranscription,
  stopTranscription,
  abortTranscription,
  feedAudioData,
  onTranscription,
} from '../services/transcriptionService';
import { electron } from '../lib/electron';
import type {
  AudioSource,
  TranscriptionEvent,
  AudioLevelData,
  RecordingState,
} from '../../shared/types';

interface LiveSegment {
  id: string;
  text: string;
  language: 'ar' | 'en';
  startTime: number;
  endTime: number;
  speakerId: string | null;
  confidence: number;
  isFinal: boolean;
}

interface RecordingStoreState {
  // Session
  sessionId: string | null;
  conversationId: string | null;
  audioSource: AudioSource;
  startedAt: number | null;
  elapsedSeconds: number;

  // State
  recordingState: RecordingState;

  // Audio levels for visualization
  audioLevel: number; // 0-1
  audioLevelHistory: number[]; // Last N levels for waveform

  // Live transcript
  liveSegments: LiveSegment[];
  interimText: string; // Current partial recognition

  // Actions
  startRecording: (source?: AudioSource) => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  triggerPrivacyPause: () => Promise<void>;
}

const LEVEL_HISTORY_SIZE = 64; // Number of samples for waveform display

let timerInterval: number | null = null;
let cleanupAudioData: (() => void) | null = null;
let cleanupAudioLevel: (() => void) | null = null;
let cleanupTranscription: (() => void) | null = null;

export const useRecordingStore = create<RecordingStoreState>((set, get) => ({
  // Session
  sessionId: null,
  conversationId: null,
  audioSource: 'microphone',
  startedAt: null,
  elapsedSeconds: 0,

  // State
  recordingState: 'idle',

  // Audio levels
  audioLevel: 0,
  audioLevelHistory: new Array(LEVEL_HISTORY_SIZE).fill(0),

  // Live transcript
  liveSegments: [],
  interimText: '',

  // ─── Actions ───

  startRecording: async (source: AudioSource = 'microphone') => {
    const conversationId = uuidv4();
    const sessionId = uuidv4();

    set({
      sessionId,
      conversationId,
      audioSource: source,
      startedAt: Date.now(),
      elapsedSeconds: 0,
      recordingState: 'recording',
      liveSegments: [],
      interimText: '',
      audioLevel: 0,
      audioLevelHistory: new Array(LEVEL_HISTORY_SIZE).fill(0),
    });

    // Start audio capture
    await startCapture(source);

    // Wire PCM data to transcription service
    cleanupAudioData = onAudioData((pcmData) => {
      feedAudioData(pcmData);
    });

    // Wire audio level updates
    cleanupAudioLevel = onAudioLevel((data: AudioLevelData) => {
      set((state) => {
        const newHistory = [...state.audioLevelHistory.slice(1), data.level];
        return { audioLevel: data.level, audioLevelHistory: newHistory };
      });
    });

    // Wire transcription events
    cleanupTranscription = onTranscription((event: TranscriptionEvent) => {
      if (event.type === 'interim') {
        set({ interimText: event.text });
      } else {
        // Final result — add to segments and clear interim
        const segment: LiveSegment = {
          id: uuidv4(),
          text: event.text,
          language: event.language,
          startTime: event.startTime,
          endTime: event.endTime,
          speakerId: event.speakerId,
          confidence: event.confidence,
          isFinal: true,
        };

        set((state) => ({
          liveSegments: [...state.liveSegments, segment],
          interimText: '',
        }));
      }
    });

    // Start transcription
    startTranscription();

    // Elapsed time counter
    timerInterval = window.setInterval(() => {
      const { startedAt, recordingState: currentState } = get();
      if (startedAt && currentState === 'recording') {
        set({ elapsedSeconds: Math.floor((Date.now() - startedAt) / 1000) });
      }
    }, 1000);

    // Notify main process
    electron?.updateTrayState('recording');
  },

  stopRecording: async () => {
    // Stop timer
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // Stop transcription
    stopTranscription();

    // Stop audio capture and get recorded blob
    const audioBlob = await stopCapture();

    // Save audio file if we have data
    const { conversationId, liveSegments, elapsedSeconds } = get();
    if (audioBlob && conversationId) {
      try {
        const audioPath = await electron?.dbQuery(
          'SELECT 1' // placeholder
        ).catch(() => null);

        // Save audio blob to file via main process
        // In production, this writes to the user's data directory
        if (audioBlob.size > 0) {
          // Convert blob to array buffer for IPC transfer
          const arrayBuffer = await audioBlob.arrayBuffer();
          console.log(`Audio recorded: ${(arrayBuffer.byteLength / 1024).toFixed(1)}KB`);
        }
      } catch (error) {
        console.error('Failed to save audio:', error);
      }

      // Save conversation to database
      try {
        await electron?.dbExec(
          `INSERT INTO conversations (id, title, duration, status, created_at, updated_at)
           VALUES (?, ?, ?, 'complete', datetime('now'), datetime('now'))`,
          [conversationId, `Recording ${new Date().toLocaleString()}`, elapsedSeconds]
        );

        // Save transcript segments
        for (const segment of liveSegments) {
          await electron?.dbExec(
            `INSERT INTO transcript_segments (id, conversation_id, speaker_label, text, start_time, end_time, language, confidence)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              segment.id,
              conversationId,
              segment.speakerId || 'Speaker',
              segment.text,
              segment.startTime,
              segment.endTime,
              segment.language,
              segment.confidence,
            ]
          );
        }
      } catch (error) {
        console.error('Failed to save conversation:', error);
      }
    }

    // Cleanup callbacks
    cleanupAudioData?.();
    cleanupAudioLevel?.();
    cleanupTranscription?.();
    cleanupAudioData = null;
    cleanupAudioLevel = null;
    cleanupTranscription = null;

    set({
      recordingState: 'idle',
      sessionId: null,
      audioLevel: 0,
      interimText: '',
    });

    // Notify main process
    electron?.updateTrayState('idle');
  },

  pauseRecording: () => {
    pauseCapture();
    set({ recordingState: 'paused' });
    electron?.updateTrayState('paused');
  },

  resumeRecording: () => {
    resumeCapture();
    set({ recordingState: 'recording' });
    electron?.updateTrayState('recording');
  },

  triggerPrivacyPause: async () => {
    // Stop timer
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // Immediately abort transcription — no further data sent to cloud
    abortTranscription();

    // Immediately stop all audio capture and clear buffers
    await audioPrivacyPause();

    // Cleanup callbacks
    cleanupAudioData?.();
    cleanupAudioLevel?.();
    cleanupTranscription?.();
    cleanupAudioData = null;
    cleanupAudioLevel = null;
    cleanupTranscription = null;

    set({
      recordingState: 'privacy_pause',
      audioLevel: 0,
      audioLevelHistory: new Array(LEVEL_HISTORY_SIZE).fill(0),
      interimText: '',
      sessionId: null,
      conversationId: null,
      startedAt: null,
    });

    // Notify main process
    electron?.updateTrayState('privacy_pause');
  },
}));
