import { ipcMain, BrowserWindow } from 'electron';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import {
  IPC_CHANNELS,
  AudioSource,
  RecordingSession,
  RecordingState,
} from '../../shared/types';

let currentSession: RecordingSession | null = null;
let mainWindowRef: BrowserWindow | null = null;

const AUDIO_DIR = path.join(app.getPath('userData'), 'audio');

function ensureAudioDir(): void {
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }
}

export function getAudioDir(): string {
  ensureAudioDir();
  return AUDIO_DIR;
}

export function getCurrentSession(): RecordingSession | null {
  return currentSession;
}

export function initAudioEngine(mainWindow: BrowserWindow): void {
  mainWindowRef = mainWindow;
  ensureAudioDir();

  // Handle recording start — creates session, renderer handles actual audio capture
  ipcMain.handle(IPC_CHANNELS.RECORDING_START, (_event, source: AudioSource = 'microphone') => {
    const sessionId = uuidv4();
    const conversationId = uuidv4();
    const audioFileName = `${conversationId}_${Date.now()}.webm`;
    const audioPath = path.join(AUDIO_DIR, audioFileName);

    currentSession = {
      id: sessionId,
      conversationId,
      startedAt: new Date().toISOString(),
      source,
      audioPath,
    };

    return currentSession;
  });

  // Handle recording stop — finalize session
  ipcMain.handle(IPC_CHANNELS.RECORDING_STOP, () => {
    const session = currentSession;
    currentSession = null;
    return session;
  });

  // Handle recording pause
  ipcMain.handle(IPC_CHANNELS.RECORDING_PAUSE, () => {
    // Pause is managed by the renderer's MediaRecorder
    return { paused: true };
  });

  // Handle privacy pause — clear everything
  ipcMain.handle(IPC_CHANNELS.RECORDING_PRIVACY_PAUSE, () => {
    const session = currentSession;
    currentSession = null;

    // Notify renderer to kill audio streams immediately
    mainWindowRef?.webContents.send(IPC_CHANNELS.RECORDING_STATE_CHANGED, 'privacy_pause' as RecordingState);

    return { cleared: true, session };
  });

  // Handle saving audio blob from renderer
  ipcMain.handle(
    IPC_CHANNELS.AUDIO_SAVE_PATH,
    (_event, conversationId: string) => {
      ensureAudioDir();
      const audioFileName = `${conversationId}_${Date.now()}.webm`;
      return path.join(AUDIO_DIR, audioFileName);
    }
  );
}

export function getAudioFileSize(filePath: string): number {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

export function deleteAudioFile(filePath: string): boolean {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * List all audio files sorted by modification time (newest first)
 */
export function listAudioFiles(): Array<{ path: string; size: number; mtime: Date }> {
  ensureAudioDir();
  try {
    return fs
      .readdirSync(AUDIO_DIR)
      .filter((f) => f.endsWith('.webm') || f.endsWith('.opus'))
      .map((f) => {
        const fullPath = path.join(AUDIO_DIR, f);
        const stats = fs.statSync(fullPath);
        return { path: fullPath, size: stats.size, mtime: stats.mtime };
      })
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
  } catch {
    return [];
  }
}
