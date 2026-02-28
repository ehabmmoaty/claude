/**
 * Task Service — CRUD operations for tasks extracted from conversations.
 */

import { electron, isElectron } from '../lib/electron';
import { MOCK_TASKS } from '../lib/webPreviewData';
import type { Task } from '../../shared/types';

// ─── Row types from SQLite (snake_case) ───

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  owner_id: string | null;
  owner_name: string | null;
  due_date: string | null;
  source_conversation_id: string | null;
  source_segment_id: string | null;
  planner_id: string | null;
  category: 'my_tasks' | 'delegated' | 'waiting_on';
  created_at: string;
  updated_at: string;
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    dueDate: row.due_date,
    sourceConversationId: row.source_conversation_id,
    sourceSegmentId: row.source_segment_id,
    plannerId: row.planner_id,
    category: row.category,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Filter types ───

export type TaskCategory = 'my_tasks' | 'delegated' | 'waiting_on';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskFilters {
  category: TaskCategory;
  status?: TaskStatus;
  priority?: TaskPriority;
  search: string;
  sortField: 'created_at' | 'due_date' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
}

// ─── Service Functions ───

/** Fetch tasks with filters */
export async function fetchTasks(
  filters: Partial<TaskFilters> = {}
): Promise<{ tasks: Task[]; total: number }> {
  if (!isElectron) {
    const { category = 'my_tasks', search = '', status, priority, sortOrder = 'desc' } = filters;
    let results = MOCK_TASKS.filter((t) => t.category === category);
    if (status) results = results.filter((t) => t.status === status);
    if (priority) results = results.filter((t) => t.priority === priority);
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
      );
    }
    if (sortOrder === 'asc') results.reverse();
    return { tasks: results, total: results.length };
  }

  const {
    category = 'my_tasks',
    search = '',
    status,
    priority,
    sortField = 'created_at',
    sortOrder = 'desc',
  } = filters;

  const conditions: string[] = ['category = ?'];
  const params: unknown[] = [category];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (priority) {
    conditions.push('priority = ?');
    params.push(priority);
  }
  if (search.trim()) {
    conditions.push('(title LIKE ? OR description LIKE ?)');
    params.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;
  const allowedSorts: Record<string, string> = {
    created_at: 'created_at',
    due_date: 'due_date',
    priority: "CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END",
    title: 'title',
  };
  const sortCol = allowedSorts[sortField] || 'created_at';

  const countResult = (await electron?.dbQuery(
    `SELECT COUNT(*) as total FROM tasks ${whereClause}`,
    params
  )) as { total: number }[];
  const total = countResult?.[0]?.total ?? 0;

  const rows = (await electron?.dbQuery(
    `SELECT * FROM tasks ${whereClause} ORDER BY ${sortCol} ${sortOrder === 'asc' ? 'ASC' : 'DESC'}`,
    params
  )) as TaskRow[];

  return { tasks: (rows || []).map(toTask), total };
}

/** Create a new task */
export async function createTask(task: Omit<Task, 'createdAt' | 'updatedAt'>): Promise<void> {
  if (!isElectron) return;
  await electron?.dbExec(
    `INSERT INTO tasks (id, title, description, status, priority, owner_id, owner_name, due_date, source_conversation_id, source_segment_id, planner_id, category)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      task.id, task.title, task.description, task.status, task.priority,
      task.ownerId, task.ownerName, task.dueDate,
      task.sourceConversationId, task.sourceSegmentId, task.plannerId, task.category,
    ]
  );
}

/** Update task status */
export async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
  if (!isElectron) return;
  await electron?.dbExec(
    `UPDATE tasks SET status = ?, updated_at = datetime('now') WHERE id = ?`,
    [status, id]
  );
}

/** Update task priority */
export async function updateTaskPriority(id: string, priority: TaskPriority): Promise<void> {
  if (!isElectron) return;
  await electron?.dbExec(
    `UPDATE tasks SET priority = ?, updated_at = datetime('now') WHERE id = ?`,
    [priority, id]
  );
}

/** Update task details */
export async function updateTask(id: string, updates: Partial<Pick<Task, 'title' | 'description' | 'dueDate' | 'ownerName' | 'status' | 'priority'>>): Promise<void> {
  if (!isElectron) return;
  const fields: string[] = [];
  const params: unknown[] = [];
  if (updates.title !== undefined) { fields.push('title = ?'); params.push(updates.title); }
  if (updates.description !== undefined) { fields.push('description = ?'); params.push(updates.description); }
  if (updates.dueDate !== undefined) { fields.push('due_date = ?'); params.push(updates.dueDate); }
  if (updates.ownerName !== undefined) { fields.push('owner_name = ?'); params.push(updates.ownerName); }
  if (updates.status !== undefined) { fields.push('status = ?'); params.push(updates.status); }
  if (updates.priority !== undefined) { fields.push('priority = ?'); params.push(updates.priority); }
  if (fields.length === 0) return;
  fields.push("updated_at = datetime('now')");
  params.push(id);
  await electron?.dbExec(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, params);
}

/** Delete a task */
export async function deleteTask(id: string): Promise<void> {
  if (!isElectron) return;
  await electron?.dbExec(`DELETE FROM tasks WHERE id = ?`, [id]);
}

/** Get task counts by category */
export async function fetchTaskCounts(): Promise<Record<TaskCategory, number>> {
  if (!isElectron) {
    return {
      my_tasks: MOCK_TASKS.filter((t) => t.category === 'my_tasks').length,
      delegated: MOCK_TASKS.filter((t) => t.category === 'delegated').length,
      waiting_on: MOCK_TASKS.filter((t) => t.category === 'waiting_on').length,
    };
  }

  const rows = (await electron?.dbQuery(
    `SELECT category, COUNT(*) as count FROM tasks GROUP BY category`,
    []
  )) as { category: TaskCategory; count: number }[];

  const counts: Record<TaskCategory, number> = { my_tasks: 0, delegated: 0, waiting_on: 0 };
  (rows || []).forEach((r) => { counts[r.category] = r.count; });
  return counts;
}
