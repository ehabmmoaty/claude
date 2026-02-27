import { autoUpdater } from 'electron-updater';
import { app, dialog, BrowserWindow } from 'electron';

export function initUpdater(): void {
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    return; // Skip auto-updates in development
  }

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', async (info) => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    const result = await dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available. Would you like to download it?`,
      buttons: ['Download', 'Later'],
      defaultId: 0,
    });

    if (result.response === 0) {
      autoUpdater.downloadUpdate();
    }
  });

  autoUpdater.on('update-downloaded', async () => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    const result = await dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Update Ready',
      message: 'Update downloaded. The app will restart to apply the update.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
    });

    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });

  autoUpdater.on('error', (error) => {
    console.error('Auto-updater error:', error);
  });

  // Check for updates after startup
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(console.error);
  }, 10_000);
}
