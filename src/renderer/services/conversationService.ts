/**
 * Conversation Service — CRUD operations for conversations and transcripts
 *
 * All data access goes through IPC to the main process SQLite database.
 * This service provides typed wrappers around raw SQL queries.
 */

import { electron, isElectron } from '../lib/electron';
import {
  MOCK_CONVERSATIONS,
  MOCK_SEGMENTS,
  MOCK_HIGHLIGHTS,
} from '../lib/webPreviewData';
import type { Conversation, TranscriptSegment } from '../../shared/types';

// ─── Row types from SQLite (snake_case) ───

interface ConversationRow {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  duration: number;
  companion_id: string | null;
  tags: string;
  speaker_count: number;
  audio_path: string | null;
  status: 'recording' | 'processing' | 'complete';
  segment_count?: number;
}

interface SegmentRow {
  id: string;
  conversation_id: string;
  speaker_id: string | null;
  speaker_label: string;
  text: string;
  start_time: number;
  end_time: number;
  language: 'ar' | 'en';
  confidence: number;
}

interface HighlightRow {
  id: string;
  conversation_id: string;
  type: 'key_point' | 'decision' | 'commitment' | 'action_item';
  text: string;
  source_segment_id: string | null;
  created_at: string;
}

interface FTSResult {
  conversation_id: string;
  text: string;
  rank: number;
}

// ─── Type converters ───

function toConversation(row: ConversationRow): Conversation & { segmentCount?: number } {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    duration: row.duration,
    companionId: row.companion_id,
    tags: JSON.parse(row.tags || '[]'),
    speakerCount: row.speaker_count,
    audioPath: row.audio_path,
    status: row.status,
    segmentCount: row.segment_count,
  };
}

function toSegment(row: SegmentRow): TranscriptSegment {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    speakerId: row.speaker_id,
    speakerLabel: row.speaker_label,
    text: row.text,
    startTime: row.start_time,
    endTime: row.end_time,
    language: row.language,
    confidence: row.confidence,
  };
}

export interface Highlight {
  id: string;
  conversationId: string;
  type: 'key_point' | 'decision' | 'commitment' | 'action_item';
  text: string;
  sourceSegmentId: string | null;
  createdAt: string;
}

function toHighlight(row: HighlightRow): Highlight {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    type: row.type,
    text: row.text,
    sourceSegmentId: row.source_segment_id,
    createdAt: row.created_at,
  };
}

// ─── Filter types ───

export type DateFilter = 'all' | 'today' | 'week' | 'month';
export type SortField = 'created_at' | 'duration' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface ConversationFilters {
  dateFilter: DateFilter;
  search: string;
  sortField: SortField;
  sortOrder: SortOrder;
  limit: number;
  offset: number;
}

// ─── Service Functions ───

/** Fetch conversations with filters, search, and pagination */
export async function fetchConversations(
  filters: Partial<ConversationFilters> = {}
): Promise<{ conversations: (Conversation & { segmentCount?: number })[]; total: number }> {
  // Web preview: return mock data
  if (!isElectron) {
    const { search = '', sortOrder = 'desc' } = filters;
    let results = [...MOCK_CONVERSATIONS];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter((c) => c.title.toLowerCase().includes(q));
    }
    if (sortOrder === 'asc') results.reverse();
    return { conversations: results, total: results.length };
  }

  const {
    dateFilter = 'all',
    search = '',
    sortField = 'created_at',
    sortOrder = 'desc',
    limit = 50,
    offset = 0,
  } = filters;

  const conditions: string[] = [];
  const params: unknown[] = [];

  // Date filter
  if (dateFilter === 'today') {
    conditions.push("c.created_at >= datetime('now', 'start of day')");
  } else if (dateFilter === 'week') {
    conditions.push("c.created_at >= datetime('now', '-7 days')");
  } else if (dateFilter === 'month') {
    conditions.push("c.created_at >= datetime('now', '-30 days')");
  }

  // Text search — use FTS if search term provided
  if (search.trim()) {
    conditions.push(`c.id IN (
      SELECT DISTINCT ts.conversation_id FROM transcript_segments ts
      JOIN transcript_fts ON transcript_fts.rowid = ts.rowid
      WHERE transcript_fts MATCH ?
      UNION
      SELECT id FROM conversations WHERE title LIKE ?
    )`);
    params.push(search.trim(), `%${search.trim()}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Validate sort field
  const allowedSorts: Record<string, string> = {
    created_at: 'c.created_at',
    duration: 'c.duration',
    title: 'c.title',
  };
  const sortCol = allowedSorts[sortField] || 'c.created_at';

  // Get total count
  const countResult = await electron?.dbQuery(
    `SELECT COUNT(*) as total FROM conversations c ${whereClause}`,
    params
  ) as { total: number }[];
  const total = countResult?.[0]?.total ?? 0;

  // Get conversations with segment count
  const rows = await electron?.dbQuery(
    `SELECT c.*,
       (SELECT COUNT(*) FROM transcript_segments ts WHERE ts.conversation_id = c.id) as segment_count
     FROM conversations c
     ${whereClause}
     ORDER BY ${sortCol} ${sortOrder === 'asc' ? 'ASC' : 'DESC'}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  ) as ConversationRow[];

  return {
    conversations: (rows || []).map(toConversation),
    total,
  };
}

/** Fetch a single conversation by ID */
export async function fetchConversation(id: string): Promise<(Conversation & { segmentCount?: number }) | null> {
  if (!isElectron) return MOCK_CONVERSATIONS.find((c) => c.id === id) ?? null;

  const rows = await electron?.dbQuery(
    `SELECT c.*,
       (SELECT COUNT(*) FROM transcript_segments ts WHERE ts.conversation_id = c.id) as segment_count
     FROM conversations c
     WHERE c.id = ?`,
    [id]
  ) as ConversationRow[];

  if (!rows || rows.length === 0) return null;
  return toConversation(rows[0]);
}

/** Fetch all transcript segments for a conversation */
export async function fetchTranscriptSegments(conversationId: string): Promise<TranscriptSegment[]> {
  if (!isElectron) return MOCK_SEGMENTS.filter((s) => s.conversationId === conversationId);

  const rows = await electron?.dbQuery(
    `SELECT * FROM transcript_segments
     WHERE conversation_id = ?
     ORDER BY start_time ASC`,
    [conversationId]
  ) as SegmentRow[];

  return (rows || []).map(toSegment);
}

/** Fetch highlights for a conversation */
export async function fetchHighlights(conversationId: string): Promise<Highlight[]> {
  if (!isElectron) return MOCK_HIGHLIGHTS.filter((h) => h.conversationId === conversationId);

  const rows = await electron?.dbQuery(
    `SELECT * FROM highlights
     WHERE conversation_id = ?
     ORDER BY created_at ASC`,
    [conversationId]
  ) as HighlightRow[];

  return (rows || []).map(toHighlight);
}

/** Update conversation title */
export async function updateConversationTitle(id: string, title: string): Promise<void> {
  await electron?.dbExec(
    `UPDATE conversations SET title = ?, updated_at = datetime('now') WHERE id = ?`,
    [title, id]
  );
}

/** Update conversation tags */
export async function updateConversationTags(id: string, tags: string[]): Promise<void> {
  await electron?.dbExec(
    `UPDATE conversations SET tags = ?, updated_at = datetime('now') WHERE id = ?`,
    [JSON.stringify(tags), id]
  );
}

/** Delete a conversation and all related data */
export async function deleteConversation(id: string): Promise<void> {
  // CASCADE will handle transcript_segments and highlights
  await electron?.dbExec(`DELETE FROM conversations WHERE id = ?`, [id]);
}

/** Add a highlight to a conversation */
export async function addHighlight(
  id: string,
  conversationId: string,
  type: Highlight['type'],
  text: string,
  sourceSegmentId?: string
): Promise<void> {
  await electron?.dbExec(
    `INSERT INTO highlights (id, conversation_id, type, text, source_segment_id) VALUES (?, ?, ?, ?, ?)`,
    [id, conversationId, type, text, sourceSegmentId ?? null]
  );
}

/** Remove a highlight */
export async function removeHighlight(id: string): Promise<void> {
  await electron?.dbExec(`DELETE FROM highlights WHERE id = ?`, [id]);
}

/** Full-text search across all transcripts */
export async function searchTranscripts(query: string, limit = 20): Promise<{
  conversationId: string;
  text: string;
  rank: number;
}[]> {
  if (!query.trim()) return [];

  const rows = await electron?.dbQuery(
    `SELECT ts.conversation_id, ts.text, rank
     FROM transcript_fts
     JOIN transcript_segments ts ON transcript_fts.rowid = ts.rowid
     WHERE transcript_fts MATCH ?
     ORDER BY rank
     LIMIT ?`,
    [query.trim(), limit]
  ) as FTSResult[];

  return (rows || []).map((r) => ({
    conversationId: r.conversation_id,
    text: r.text,
    rank: r.rank,
  }));
}

/** Get recent conversations for the home page */
export async function fetchRecentConversations(limit = 5): Promise<Conversation[]> {
  if (!isElectron) return MOCK_CONVERSATIONS.slice(0, limit);

  const rows = await electron?.dbQuery(
    `SELECT * FROM conversations
     WHERE status = 'complete'
     ORDER BY created_at DESC
     LIMIT ?`,
    [limit]
  ) as ConversationRow[];

  return (rows || []).map(toConversation);
}
