import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, RecordingState } from '../shared/types';

const electronAPI = {
  // Auth
  login: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGIN),
  logout: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH_LOGOUT),
  getUser: () => ipcRenderer.invoke(IPC_CHANNELS.AUTH_GET_USER),

  // Recording
  startRecording: () => ipcRenderer.send(IPC_CHANNELS.RECORDING_START),
  stopRecording: () => ipcRenderer.send(IPC_CHANNELS.RECORDING_STOP),
  pauseRecording: () => ipcRenderer.send(IPC_CHANNELS.RECORDING_PAUSE),
  privacyPause: () => ipcRenderer.send(IPC_CHANNELS.RECORDING_PRIVACY_PAUSE),
  onRecordingStateChanged: (callback: (state: RecordingState) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: RecordingState) => callback(state);
    ipcRenderer.on(IPC_CHANNELS.RECORDING_STATE_CHANGED, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.RECORDING_STATE_CHANGED, handler);
  },

  // Tray
  updateTrayState: (state: RecordingState) =>
    ipcRenderer.send(IPC_CHANNELS.TRAY_UPDATE_STATE, state),

  // Hotkeys
  onHotkeyRecord: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on(IPC_CHANNELS.HOTKEY_RECORD, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.HOTKEY_RECORD, handler);
  },
  onHotkeyQuickAsk: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on(IPC_CHANNELS.HOTKEY_QUICK_ASK, handler);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.HOTKEY_QUICK_ASK, handler);
  },

  // Database
  dbQuery: (sql: string, params?: unknown[]) =>
    ipcRenderer.invoke(IPC_CHANNELS.DB_QUERY, sql, params),
  dbExec: (sql: string, params?: unknown[]) =>
    ipcRenderer.invoke(IPC_CHANNELS.DB_EXEC, sql, params),

  // App
  getVersion: () => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION),
  checkForUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.APP_CHECK_UPDATE),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

export type ElectronAPI = typeof electronAPI;
