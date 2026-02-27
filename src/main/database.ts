import Database from 'better-sqlite3';
import { app, ipcMain } from 'electron';
import path from 'path';
import { IPC_CHANNELS } from '../shared/types';

let db: Database.Database | null = null;

const SCHEMA = `
  -- Companions (AI assistants)
  CREATE TABLE IF NOT EXISTS companions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    description_ar TEXT NOT NULL DEFAULT '',
    system_prompt TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'bot',
    is_built_in INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Speakers (voice profiles)
  CREATE TABLE IF NOT EXISTS speakers (
    id TEXT PRIMARY KEY,
    name TEXT,
    is_user INTEGER NOT NULL DEFAULT 0,
    voice_profile_id TEXT,
    first_seen TEXT NOT NULL DEFAULT (datetime('now')),
    last_seen TEXT NOT NULL DEFAULT (datetime('now')),
    conversation_count INTEGER NOT NULL DEFAULT 0
  );

  -- Conversations
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Untitled Conversation',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    duration INTEGER NOT NULL DEFAULT 0,
    companion_id TEXT REFERENCES companions(id),
    tags TEXT NOT NULL DEFAULT '[]',
    speaker_count INTEGER NOT NULL DEFAULT 0,
    audio_path TEXT,
    status TEXT NOT NULL DEFAULT 'recording' CHECK(status IN ('recording', 'processing', 'complete'))
  );

  -- Transcript segments
  CREATE TABLE IF NOT EXISTS transcript_segments (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    speaker_id TEXT REFERENCES speakers(id),
    speaker_label TEXT NOT NULL DEFAULT 'Unknown',
    text TEXT NOT NULL,
    start_time REAL NOT NULL,
    end_time REAL NOT NULL,
    language TEXT NOT NULL DEFAULT 'en' CHECK(language IN ('ar', 'en')),
    confidence REAL NOT NULL DEFAULT 0.0
  );

  -- Tasks
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo', 'in_progress', 'done')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
    owner_id TEXT,
    owner_name TEXT,
    due_date TEXT,
    source_conversation_id TEXT REFERENCES conversations(id),
    source_segment_id TEXT REFERENCES transcript_segments(id),
    planner_id TEXT,
    category TEXT NOT NULL DEFAULT 'my_tasks' CHECK(category IN ('my_tasks', 'delegated', 'waiting_on')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Highlights (key points, decisions, commitments)
  CREATE TABLE IF NOT EXISTS highlights (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK(type IN ('key_point', 'decision', 'commitment', 'action_item')),
    text TEXT NOT NULL,
    source_segment_id TEXT REFERENCES transcript_segments(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Full-text search on transcript segments
  CREATE VIRTUAL TABLE IF NOT EXISTS transcript_fts USING fts5(
    text,
    content='transcript_segments',
    content_rowid='rowid',
    tokenize='unicode61'
  );

  -- Indexes for common queries
  CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_conversations_companion_id ON conversations(companion_id);
  CREATE INDEX IF NOT EXISTS idx_transcript_segments_conversation_id ON transcript_segments(conversation_id);
  CREATE INDEX IF NOT EXISTS idx_transcript_segments_start_time ON transcript_segments(start_time);
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
  CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
  CREATE INDEX IF NOT EXISTS idx_highlights_conversation_id ON highlights(conversation_id);

  -- Triggers to keep FTS in sync
  CREATE TRIGGER IF NOT EXISTS transcript_fts_insert AFTER INSERT ON transcript_segments BEGIN
    INSERT INTO transcript_fts(rowid, text) VALUES (new.rowid, new.text);
  END;

  CREATE TRIGGER IF NOT EXISTS transcript_fts_delete AFTER DELETE ON transcript_segments BEGIN
    INSERT INTO transcript_fts(transcript_fts, rowid, text) VALUES('delete', old.rowid, old.text);
  END;

  CREATE TRIGGER IF NOT EXISTS transcript_fts_update AFTER UPDATE ON transcript_segments BEGIN
    INSERT INTO transcript_fts(transcript_fts, rowid, text) VALUES('delete', old.rowid, old.text);
    INSERT INTO transcript_fts(rowid, text) VALUES (new.rowid, new.text);
  END;
`;

const DEFAULT_COMPANIONS = `
  INSERT OR IGNORE INTO companions (id, name, name_ar, description, description_ar, system_prompt, icon, is_built_in)
  VALUES
    ('meeting-coach', 'Meeting Excellence Coach', 'مدرب التميز في الاجتماعات',
     'Analyzes meetings for effectiveness, participation balance, and follow-through.',
     'يحلل الاجتماعات من حيث الفعالية وتوازن المشاركة والمتابعة.',
     'You are the Meeting Excellence Coach for Abu Dhabi Government leaders. Analyze meeting transcripts to identify: participation patterns, decision quality, action item clarity, and time management. Provide specific, actionable feedback referencing exact moments in the transcript. Use formal Arabic or English matching the user''s preference. Respect government protocol and hierarchy.',
     'presentation', 1),

    ('strategic-advisor', 'Strategic Advisor', 'المستشار الاستراتيجي',
     'Provides strategic analysis and recommendations based on conversation context.',
     'يقدم تحليلات واستشارات استراتيجية بناءً على سياق المحادثة.',
     'You are a Strategic Advisor for Abu Dhabi Government senior leaders. Analyze discussions for strategic implications, alignment with Abu Dhabi Vision, risks, and opportunities. Reference specific points from transcripts. Provide balanced analysis with clear recommendations. Use appropriate formality and government protocol awareness.',
     'compass', 1),

    ('personal-assistant', 'Personal Assistant', 'المساعد الشخصي',
     'Manages tasks, follow-ups, and daily organization from conversation context.',
     'يدير المهام والمتابعات والتنظيم اليومي من سياق المحادثة.',
     'You are a Personal Assistant for a senior Abu Dhabi Government leader. Extract action items, track commitments, suggest follow-ups, and help manage the executive''s day. Be proactive about deadlines and dependencies. Draft communications when asked. Maintain awareness of government protocol and formal address.',
     'user', 1),

    ('finance-advisor', 'Finance Advisor', 'المستشار المالي',
     'Analyzes financial discussions, budgets, and fiscal commitments from meetings.',
     'يحلل المناقشات المالية والميزانيات والالتزامات المالية من الاجتماعات.',
     'You are a Finance Advisor for Abu Dhabi Government entities. Analyze meeting discussions related to budgets, expenditures, revenue, and financial commitments. Flag fiscal risks, track budget commitments mentioned in conversations, and provide financial context. Always caveat that recommendations should be reviewed by qualified financial professionals.',
     'banknote', 1),

    ('protocol-coach', 'Protocol & Etiquette Coach', 'مدرب البروتوكول والإتيكيت',
     'Guides on government protocol, diplomatic etiquette, and formal communication.',
     'يوجه في بروتوكول الحكومة والإتيكيت الدبلوماسي والتواصل الرسمي.',
     'You are a Protocol & Etiquette Coach specializing in UAE government and diplomatic contexts. Advise on proper forms of address, meeting protocol, communication etiquette, and cultural norms. Reference Majlis traditions, government hierarchy, and international diplomatic standards. Help draft formal communications with appropriate honorifics and structure.',
     'crown', 1);
`;

export function initDatabase(): void {
  const dbPath = path.join(app.getPath('userData'), 'anees.db');
  db = new Database(dbPath);

  // Enable WAL mode for better concurrent performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create schema
  db.exec(SCHEMA);

  // Seed default companions
  db.exec(DEFAULT_COMPANIONS);

  // Set up IPC handlers for database access
  ipcMain.handle(IPC_CHANNELS.DB_QUERY, (_event, sql: string, params?: unknown[]) => {
    if (!db) throw new Error('Database not initialized');
    const stmt = db.prepare(sql);
    return params ? stmt.all(...params) : stmt.all();
  });

  ipcMain.handle(IPC_CHANNELS.DB_EXEC, (_event, sql: string, params?: unknown[]) => {
    if (!db) throw new Error('Database not initialized');
    const stmt = db.prepare(sql);
    return params ? stmt.run(...params) : stmt.run();
  });
}

export function getDatabase(): Database.Database {
  if (!db) throw new Error('Database not initialized');
  return db;
}
