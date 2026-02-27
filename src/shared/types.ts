// ─── Core Entity Types ───

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  duration: number; // seconds
  companionId: string | null;
  tags: string[];
  speakerCount: number;
  audioPath: string | null;
  status: 'recording' | 'processing' | 'complete';
}

export interface TranscriptSegment {
  id: string;
  conversationId: string;
  speakerId: string | null;
  speakerLabel: string;
  text: string;
  startTime: number; // seconds
  endTime: number;
  language: 'ar' | 'en';
  confidence: number;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  ownerId: string | null;
  ownerName: string | null;
  dueDate: string | null;
  sourceConversationId: string | null;
  sourceSegmentId: string | null;
  plannerId: string | null; // Microsoft Planner task ID
  category: 'my_tasks' | 'delegated' | 'waiting_on';
  createdAt: string;
  updatedAt: string;
}

export interface Companion {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  systemPrompt: string;
  icon: string;
  isBuiltIn: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Speaker {
  id: string;
  name: string | null;
  isUser: boolean;
  voiceProfileId: string | null;
  firstSeen: string;
  lastSeen: string;
  conversationCount: number;
}

// ─── App State Types ───

export type RecordingState = 'idle' | 'listening' | 'recording' | 'paused' | 'privacy_pause';

export type AppLocale = 'ar' | 'en';

export type ThemeMode = 'light' | 'dark' | 'system';

export type NavigationTab = 'home' | 'conversations' | 'tasks' | 'agents' | 'search';

// ─── Auth Types ───

export interface AuthUser {
  id: string;
  displayName: string;
  email: string;
  tenantId: string;
  accessToken: string;
}

// ─── IPC Channel Types ───

export const IPC_CHANNELS = {
  // Auth
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_GET_USER: 'auth:get-user',

  // Recording
  RECORDING_START: 'recording:start',
  RECORDING_STOP: 'recording:stop',
  RECORDING_PAUSE: 'recording:pause',
  RECORDING_PRIVACY_PAUSE: 'recording:privacy-pause',
  RECORDING_STATE_CHANGED: 'recording:state-changed',

  // Tray
  TRAY_UPDATE_STATE: 'tray:update-state',

  // Hotkeys
  HOTKEY_RECORD: 'hotkey:record',
  HOTKEY_PRIVACY_PAUSE: 'hotkey:privacy-pause',
  HOTKEY_QUICK_ASK: 'hotkey:quick-ask',

  // Database
  DB_QUERY: 'db:query',
  DB_EXEC: 'db:exec',

  // App
  APP_GET_VERSION: 'app:get-version',
  APP_CHECK_UPDATE: 'app:check-update',
} as const;
