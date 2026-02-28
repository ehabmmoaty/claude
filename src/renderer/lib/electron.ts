import type { ElectronAPI } from '../../main/preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

/**
 * When running in Electron, this points to the real contextBridge API.
 * When running in a browser (web preview), this is null — all electron?.calls become no-ops.
 */
export const electron: ElectronAPI | null =
  typeof window !== 'undefined' && window.electronAPI ? window.electronAPI : null;

/** True when running inside Electron, false in browser preview */
export const isElectron = electron !== null;
