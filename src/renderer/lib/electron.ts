import type { ElectronAPI } from '../../main/preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export const electron = typeof window !== 'undefined' ? window.electronAPI : null;
