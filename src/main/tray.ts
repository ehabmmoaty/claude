import { Tray, Menu, nativeImage, BrowserWindow } from 'electron';
import path from 'path';
import { RecordingState } from '../shared/types';

let tray: Tray | null = null;
let mainWindowRef: BrowserWindow | null = null;

const TRAY_ICONS: Record<RecordingState, string> = {
  idle: 'tray-idle.png',
  listening: 'tray-listening.png',
  recording: 'tray-recording.png',
  paused: 'tray-paused.png',
  privacy_pause: 'tray-privacy.png',
};

const STATE_LABELS: Record<RecordingState, string> = {
  idle: 'Anees — Idle',
  listening: 'Anees — Listening',
  recording: 'Anees — Recording',
  paused: 'Anees — Paused',
  privacy_pause: 'Anees — Privacy Pause',
};

function getIconPath(state: RecordingState): string {
  return path.join(__dirname, '../../assets', TRAY_ICONS[state]);
}

function buildContextMenu(state: RecordingState): Menu {
  return Menu.buildFromTemplate([
    {
      label: STATE_LABELS[state],
      enabled: false,
    },
    { type: 'separator' },
    {
      label: state === 'recording' ? 'Stop Recording' : 'Start Recording',
      accelerator: 'CmdOrCtrl+Shift+R',
      click: () => {
        mainWindowRef?.webContents.send(
          state === 'recording' ? 'recording:stop' : 'recording:start'
        );
      },
    },
    {
      label: 'Privacy Pause',
      accelerator: 'CmdOrCtrl+Shift+P',
      click: () => {
        mainWindowRef?.webContents.send('recording:privacy-pause');
      },
    },
    { type: 'separator' },
    {
      label: 'Show Anees',
      click: () => {
        mainWindowRef?.show();
        mainWindowRef?.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit Anees',
      role: 'quit',
    },
  ]);
}

export function initTray(
  initialState: RecordingState,
  mainWindow: BrowserWindow | null
): void {
  mainWindowRef = mainWindow;

  // Create a simple 16x16 icon for development
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip('Anees Desktop');
  tray.setContextMenu(buildContextMenu(initialState));

  tray.on('click', () => {
    mainWindowRef?.show();
    mainWindowRef?.focus();
  });
}

export function updateTrayState(state: RecordingState): void {
  if (!tray) return;
  tray.setToolTip(STATE_LABELS[state]);
  tray.setContextMenu(buildContextMenu(state));
  // Icon update: in production, load from assets
  // tray.setImage(getIconPath(state));
}
