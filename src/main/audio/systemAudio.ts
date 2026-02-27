/**
 * System Audio Loopback Capture
 *
 * macOS: Uses BlackHole or similar virtual audio driver for loopback.
 *        Electron's desktopCapturer with audio: true captures system audio via
 *        screen share permissions.
 *
 * Windows: Uses WASAPI loopback capture via desktopCapturer.
 *
 * The renderer process uses desktopCapturer.getSources() and
 * navigator.mediaDevices.getUserMedia() with the chromeMediaSource constraint
 * to capture system audio. This module provides the main-process coordination.
 */

import { desktopCapturer, ipcMain } from 'electron';

const IPC_GET_DESKTOP_SOURCES = 'audio:get-desktop-sources';

export function initSystemAudio(): void {
  // Provide desktop sources to renderer for system audio capture
  ipcMain.handle(IPC_GET_DESKTOP_SOURCES, async () => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 0, height: 0 }, // Don't need thumbnails
      });

      return sources.map((source) => ({
        id: source.id,
        name: source.name,
        displayId: source.display_id,
      }));
    } catch (error) {
      console.error('Failed to get desktop sources:', error);
      return [];
    }
  });
}
