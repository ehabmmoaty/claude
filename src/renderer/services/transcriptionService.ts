/**
 * Transcription Service — Azure Speech SDK
 *
 * Provides real-time Arabic (ar-AE) and English (en-US) transcription
 * with automatic language detection. Streams interim and final results.
 *
 * Zero-retention: Audio is streamed directly to Azure Speech in real-time.
 * No audio is persisted to cloud storage.
 */

import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import type { TranscriptionEvent } from '../../shared/types';

export type TranscriptionCallback = (event: TranscriptionEvent) => void;

// Azure Speech configuration — uses environment variables or defaults
const SPEECH_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY || '';
const SPEECH_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION || 'uaenorth';

let recognizer: SpeechSDK.SpeechRecognizer | null = null;
let pushStream: SpeechSDK.PushAudioInputStream | null = null;
let transcriptionCallbacks: TranscriptionCallback[] = [];
let sessionStartTime = 0;
let isRunning = false;

/**
 * Initialize and start the Azure Speech recognizer
 * Uses PushAudioInputStream so we can feed PCM data from our audio capture
 */
export function startTranscription(): void {
  if (isRunning) return;

  if (!SPEECH_KEY) {
    console.warn('Azure Speech key not configured — transcription disabled');
    return;
  }

  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);

  // Enable automatic language detection for Arabic and English
  const autoDetectConfig = SpeechSDK.AutoDetectSourceLanguageConfig.fromLanguages([
    'ar-AE', // Arabic (UAE)
    'ar-SA', // Arabic (Saudi) — covers Khaleeji
    'en-US', // English
  ]);

  // Configure for real-time streaming
  speechConfig.outputFormat = SpeechSDK.OutputFormat.Detailed;
  speechConfig.setProfanity(SpeechSDK.ProfanityOption.Raw);
  speechConfig.enableDictation();

  // Create push stream for feeding PCM audio
  const format = SpeechSDK.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
  pushStream = SpeechSDK.AudioInputStream.createPushStream(format);

  const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(pushStream);

  // Create recognizer with auto language detection
  recognizer = SpeechSDK.SpeechRecognizer.FromConfig(
    speechConfig,
    autoDetectConfig,
    audioConfig
  );

  sessionStartTime = Date.now();

  // Handle interim results (recognizing)
  recognizer.recognizing = (_sender, event) => {
    if (!event.result.text) return;

    const detectedLanguage = detectLanguageFromResult(event.result);
    const now = Date.now();

    const transcriptionEvent: TranscriptionEvent = {
      type: 'interim',
      text: event.result.text,
      language: detectedLanguage,
      startTime: (now - sessionStartTime) / 1000,
      endTime: (now - sessionStartTime) / 1000,
      speakerId: null,
      confidence: 0,
    };

    emitTranscription(transcriptionEvent);
  };

  // Handle final results (recognized)
  recognizer.recognized = (_sender, event) => {
    if (event.result.reason !== SpeechSDK.ResultReason.RecognizedSpeech) return;
    if (!event.result.text) return;

    const detectedLanguage = detectLanguageFromResult(event.result);
    const duration = event.result.duration / 10_000_000; // Convert 100ns ticks to seconds
    const offset = event.result.offset / 10_000_000;

    const transcriptionEvent: TranscriptionEvent = {
      type: 'final',
      text: event.result.text,
      language: detectedLanguage,
      startTime: offset,
      endTime: offset + duration,
      speakerId: null,
      confidence: extractConfidence(event.result),
    };

    emitTranscription(transcriptionEvent);
  };

  // Handle session events
  recognizer.sessionStarted = () => {
    console.log('Transcription session started');
  };

  recognizer.sessionStopped = () => {
    console.log('Transcription session stopped');
    isRunning = false;
  };

  recognizer.canceled = (_sender, event) => {
    if (event.reason === SpeechSDK.CancellationReason.Error) {
      console.error('Transcription error:', event.errorDetails);
    }
    isRunning = false;
  };

  // Start continuous recognition
  recognizer.startContinuousRecognitionAsync(
    () => {
      isRunning = true;
      console.log('Continuous recognition started');
    },
    (error) => {
      console.error('Failed to start recognition:', error);
      isRunning = false;
    }
  );
}

/**
 * Feed PCM audio data to the transcription engine.
 * Called from the audio capture ScriptProcessor.
 * Converts Float32Array to Int16 PCM for Azure Speech SDK.
 */
export function feedAudioData(pcmFloat32: Float32Array): void {
  if (!pushStream || !isRunning) return;

  // Convert Float32 [-1, 1] to Int16 [-32768, 32767]
  const int16 = new Int16Array(pcmFloat32.length);
  for (let i = 0; i < pcmFloat32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, pcmFloat32[i]));
    int16[i] = clamped < 0 ? clamped * 32768 : clamped * 32767;
  }

  pushStream.write(int16.buffer);
}

/**
 * Stop the transcription engine
 */
export function stopTranscription(): void {
  if (!recognizer || !isRunning) return;

  recognizer.stopContinuousRecognitionAsync(
    () => {
      isRunning = false;
      pushStream?.close();
      pushStream = null;
      recognizer?.close();
      recognizer = null;
      console.log('Transcription stopped');
    },
    (error) => {
      console.error('Failed to stop recognition:', error);
      pushStream?.close();
      pushStream = null;
      recognizer?.close();
      recognizer = null;
      isRunning = false;
    }
  );
}

/**
 * Immediately halt transcription — for privacy pause
 */
export function abortTranscription(): void {
  if (pushStream) {
    pushStream.close();
    pushStream = null;
  }
  if (recognizer) {
    recognizer.close();
    recognizer = null;
  }
  isRunning = false;
}

/**
 * Check if transcription is currently running
 */
export function isTranscribing(): boolean {
  return isRunning;
}

// ─── Callback management ───

export function onTranscription(callback: TranscriptionCallback): () => void {
  transcriptionCallbacks.push(callback);
  return () => {
    transcriptionCallbacks = transcriptionCallbacks.filter((cb) => cb !== callback);
  };
}

function emitTranscription(event: TranscriptionEvent): void {
  for (const cb of transcriptionCallbacks) {
    cb(event);
  }
}

// ─── Helpers ───

function detectLanguageFromResult(result: SpeechSDK.SpeechRecognitionResult): 'ar' | 'en' {
  try {
    const autoDetect = SpeechSDK.AutoDetectSourceLanguageResult.fromResult(result);
    const lang = autoDetect.language || '';
    return lang.startsWith('ar') ? 'ar' : 'en';
  } catch {
    // Fallback: heuristic based on character set
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F]/;
    return arabicPattern.test(result.text) ? 'ar' : 'en';
  }
}

function extractConfidence(result: SpeechSDK.SpeechRecognitionResult): number {
  try {
    const json = result.properties.getProperty(
      SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult
    );
    if (json) {
      const parsed = JSON.parse(json);
      return parsed.NBest?.[0]?.Confidence ?? 0;
    }
  } catch {
    // Ignore JSON parse errors
  }
  return 0;
}
