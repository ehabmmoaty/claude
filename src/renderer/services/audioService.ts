/**
 * Audio Capture Service — Renderer Process
 *
 * Handles microphone and system audio capture using Web Audio API.
 * Provides audio level metering, MediaRecorder for file output,
 * and raw PCM streaming for the transcription service.
 */

import type { AudioSource, AudioLevelData } from '../../shared/types';

export type AudioDataCallback = (pcmData: Float32Array) => void;
export type AudioLevelCallback = (level: AudioLevelData) => void;

interface ActiveCapture {
  stream: MediaStream;
  audioContext: AudioContext;
  analyser: AnalyserNode;
  sourceNode: MediaStreamAudioSourceNode;
  mediaRecorder: MediaRecorder | null;
  recordedChunks: Blob[];
  levelIntervalId: number | null;
  scriptProcessor: ScriptProcessorNode | null;
}

let activeCapture: ActiveCapture | null = null;
let audioDataCallbacks: AudioDataCallback[] = [];
let audioLevelCallbacks: AudioLevelCallback[] = [];

/**
 * Request microphone access and start capturing audio
 */
async function captureMicrophone(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      sampleRate: 16000,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: false,
  });
}

/**
 * Request system audio via Electron's desktopCapturer
 * Uses chromeMediaSource constraint for loopback capture
 */
async function captureSystemAudio(): Promise<MediaStream> {
  // Get desktop sources from main process
  const sources = await window.electronAPI.dbQuery(
    'SELECT 1' // dummy — we use IPC directly
  ).catch(() => null);

  // Use Electron's mandatory constraints for system audio
  return navigator.mediaDevices.getUserMedia({
    audio: {
      // @ts-expect-error — Electron-specific constraint
      mandatory: {
        chromeMediaSource: 'desktop',
      },
    },
    video: {
      // @ts-expect-error — Electron requires video constraint for desktop capture
      mandatory: {
        chromeMediaSource: 'desktop',
        maxWidth: 1,
        maxHeight: 1,
        maxFrameRate: 1,
      },
    },
  });
}

/**
 * Start audio capture from the specified source
 */
export async function startCapture(
  source: AudioSource = 'microphone'
): Promise<void> {
  if (activeCapture) {
    await stopCapture();
  }

  let stream: MediaStream;

  if (source === 'system') {
    stream = await captureSystemAudio();
    // Remove video track — we only want audio
    stream.getVideoTracks().forEach((t) => t.stop());
  } else if (source === 'both') {
    const [micStream, sysStream] = await Promise.all([
      captureMicrophone(),
      captureSystemAudio().catch(() => null),
    ]);
    // Remove video tracks from system capture
    sysStream?.getVideoTracks().forEach((t) => t.stop());

    // Merge audio tracks
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const destination = audioContext.createMediaStreamDestination();

    const micSource = audioContext.createMediaStreamSource(micStream);
    micSource.connect(destination);

    if (sysStream) {
      const sysSource = audioContext.createMediaStreamSource(sysStream);
      sysSource.connect(destination);
    }

    stream = destination.stream;
  } else {
    stream = await captureMicrophone();
  }

  const audioContext = new AudioContext({ sampleRate: 16000 });
  const sourceNode = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.8;
  sourceNode.connect(analyser);

  // ScriptProcessor for raw PCM data streaming to transcription
  // Using 4096 buffer size for good balance of latency and CPU
  const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
  sourceNode.connect(scriptProcessor);
  scriptProcessor.connect(audioContext.destination);

  scriptProcessor.onaudioprocess = (event) => {
    const inputData = event.inputBuffer.getChannelData(0);
    const pcmCopy = new Float32Array(inputData);
    for (const cb of audioDataCallbacks) {
      cb(pcmCopy);
    }
  };

  // MediaRecorder for saving audio files
  let mediaRecorder: MediaRecorder | null = null;
  const recordedChunks: Blob[] = [];

  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm';

  try {
    mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      audioBitsPerSecond: 64000, // ~5MB per hour with Opus
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.start(1000); // Collect data every second
  } catch (error) {
    console.warn('MediaRecorder not available:', error);
  }

  // Audio level metering
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  const levelIntervalId = window.setInterval(() => {
    analyser.getByteTimeDomainData(dataArray);

    // Calculate RMS level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / dataArray.length);
    const level = Math.min(1, rms * 3); // Amplify and clamp to 0-1

    const data: AudioLevelData = { level, timestamp: Date.now() };
    for (const cb of audioLevelCallbacks) {
      cb(data);
    }
  }, 50); // 20fps level updates

  activeCapture = {
    stream,
    audioContext,
    analyser,
    sourceNode,
    mediaRecorder,
    recordedChunks,
    levelIntervalId,
    scriptProcessor,
  };
}

/**
 * Stop all audio capture and return recorded audio blob
 */
export async function stopCapture(): Promise<Blob | null> {
  if (!activeCapture) return null;

  const { stream, audioContext, mediaRecorder, recordedChunks, levelIntervalId, scriptProcessor } =
    activeCapture;

  // Stop level metering
  if (levelIntervalId !== null) {
    clearInterval(levelIntervalId);
  }

  // Stop script processor
  if (scriptProcessor) {
    scriptProcessor.disconnect();
  }

  // Stop MediaRecorder and wait for final data
  let audioBlob: Blob | null = null;
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    audioBlob = await new Promise<Blob>((resolve) => {
      mediaRecorder.onstop = () => {
        resolve(new Blob(recordedChunks, { type: mediaRecorder.mimeType }));
      };
      mediaRecorder.stop();
    });
  }

  // Stop all tracks
  stream.getTracks().forEach((track) => track.stop());

  // Close audio context
  await audioContext.close();

  activeCapture = null;

  return audioBlob;
}

/**
 * Pause recording (MediaRecorder only — audio analysis continues)
 */
export function pauseCapture(): void {
  if (activeCapture?.mediaRecorder?.state === 'recording') {
    activeCapture.mediaRecorder.pause();
  }
}

/**
 * Resume recording after pause
 */
export function resumeCapture(): void {
  if (activeCapture?.mediaRecorder?.state === 'paused') {
    activeCapture.mediaRecorder.resume();
  }
}

/**
 * Privacy Pause — immediately stop all capture and clear buffers
 */
export async function privacyPause(): Promise<void> {
  if (!activeCapture) return;

  const { stream, audioContext, levelIntervalId, scriptProcessor } = activeCapture;

  // Immediately stop level metering
  if (levelIntervalId !== null) {
    clearInterval(levelIntervalId);
  }

  // Disconnect script processor to stop PCM streaming
  if (scriptProcessor) {
    scriptProcessor.onaudioprocess = null;
    scriptProcessor.disconnect();
  }

  // Stop all tracks immediately
  stream.getTracks().forEach((track) => track.stop());

  // Clear recorded chunks — no residual audio preserved
  if (activeCapture.mediaRecorder && activeCapture.mediaRecorder.state !== 'inactive') {
    activeCapture.mediaRecorder.stop();
  }
  activeCapture.recordedChunks.length = 0;

  // Close audio context
  await audioContext.close();

  activeCapture = null;
}

/**
 * Check if audio is currently being captured
 */
export function isCapturing(): boolean {
  return activeCapture !== null;
}

/**
 * Get current audio levels for visualization.
 * Returns frequency data array for waveform drawing.
 */
export function getFrequencyData(): Uint8Array | null {
  if (!activeCapture) return null;
  const dataArray = new Uint8Array(activeCapture.analyser.frequencyBinCount);
  activeCapture.analyser.getByteFrequencyData(dataArray);
  return dataArray;
}

/**
 * Get time-domain waveform data for visualization
 */
export function getWaveformData(): Uint8Array | null {
  if (!activeCapture) return null;
  const dataArray = new Uint8Array(activeCapture.analyser.frequencyBinCount);
  activeCapture.analyser.getByteTimeDomainData(dataArray);
  return dataArray;
}

// ─── Callback registration ───

export function onAudioData(callback: AudioDataCallback): () => void {
  audioDataCallbacks.push(callback);
  return () => {
    audioDataCallbacks = audioDataCallbacks.filter((cb) => cb !== callback);
  };
}

export function onAudioLevel(callback: AudioLevelCallback): () => void {
  audioLevelCallbacks.push(callback);
  return () => {
    audioLevelCallbacks = audioLevelCallbacks.filter((cb) => cb !== callback);
  };
}
