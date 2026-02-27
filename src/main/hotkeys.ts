import { globalShortcut } from 'electron';

interface HotkeyHandlers {
  onRecord: () => void;
  onPrivacyPause: () => void;
  onQuickAsk: () => void;
}

const HOTKEYS = {
  record: 'CommandOrControl+Shift+R',
  privacyPause: 'CommandOrControl+Shift+P',
  quickAsk: 'CommandOrControl+Shift+A',
} as const;

export function registerHotkeys(handlers: HotkeyHandlers): void {
  const registrations = [
    { key: HOTKEYS.record, handler: handlers.onRecord },
    { key: HOTKEYS.privacyPause, handler: handlers.onPrivacyPause },
    { key: HOTKEYS.quickAsk, handler: handlers.onQuickAsk },
  ];

  for (const { key, handler } of registrations) {
    const success = globalShortcut.register(key, handler);
    if (!success) {
      console.warn(`Failed to register global hotkey: ${key}`);
    }
  }
}

export function unregisterHotkeys(): void {
  globalShortcut.unregisterAll();
}
