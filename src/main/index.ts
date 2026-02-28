import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'path';
import { initTray, updateTrayState } from './tray';
import { registerHotkeys } from './hotkeys';
import { initAuth, handleLogin, handleLogout, handleGetUser } from './auth/msal';
import { initDatabase } from './database';
import { initUpdater } from './updater';
import { initAudioEngine } from './audio/audioEngine';
import { initSystemAudio } from './audio/systemAudio';
import { IPC_CHANNELS, RecordingState } from '../shared/types';

let mainWindow: BrowserWindow | null = null;
let recordingState: RecordingState = 'idle';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Anees Desktop',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
      backgroundThrottling: false, // Keep audio processing when minimized
    },
    show: false,
  });

  // Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.azure.com https://*.microsoft.com https://*.cognitiveservices.azure.com wss://*.stt.speech.microsoft.com; img-src 'self' data:; media-src 'self' blob:",
        ],
      },
    });
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupIPC(): void {
  // Auth IPC
  ipcMain.handle(IPC_CHANNELS.AUTH_LOGIN, handleLogin);
  ipcMain.handle(IPC_CHANNELS.AUTH_LOGOUT, handleLogout);
  ipcMain.handle(IPC_CHANNELS.AUTH_GET_USER, handleGetUser);

  // Recording state IPC
  ipcMain.on(IPC_CHANNELS.TRAY_UPDATE_STATE, (_event, state: RecordingState) => {
    recordingState = state;
    updateTrayState(state);
  });

  // App info IPC
  ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, () => app.getVersion());
}

function handleRecordingStateChange(newState: RecordingState): void {
  recordingState = newState;
  updateTrayState(newState);
  mainWindow?.webContents.send(IPC_CHANNELS.RECORDING_STATE_CHANGED, newState);
}

app.whenReady().then(async () => {
  // Initialize subsystems
  initDatabase();
  initAuth();
  setupIPC();
  createWindow();
  if (mainWindow) {
    initAudioEngine(mainWindow);
  }
  initSystemAudio();
  initTray(recordingState, mainWindow);
  registerHotkeys({
    onRecord: () => {
      const newState = recordingState === 'recording' ? 'idle' : 'recording';
      handleRecordingStateChange(newState);
    },
    onPrivacyPause: () => {
      handleRecordingStateChange('privacy_pause');
    },
    onQuickAsk: () => {
      mainWindow?.show();
      mainWindow?.focus();
      mainWindow?.webContents.send(IPC_CHANNELS.HOTKEY_QUICK_ASK);
    },
  });
  initUpdater();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
