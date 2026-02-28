/**
 * Agent/Companion Service — CRUD for AI companions
 */

import { electron, isElectron } from '../lib/electron';
import { MOCK_COMPANIONS } from '../lib/webPreviewData';
import type { Companion } from '../../shared/types';

interface CompanionRow {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  system_prompt: string;
  icon: string;
  is_built_in: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

function toCompanion(row: CompanionRow): Companion {
  return {
    id: row.id,
    name: row.name,
    nameAr: row.name_ar,
    description: row.description,
    descriptionAr: row.description_ar,
    systemPrompt: row.system_prompt,
    icon: row.icon,
    isBuiltIn: row.is_built_in === 1,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Fetch all companions */
export async function fetchCompanions(): Promise<Companion[]> {
  if (!isElectron) return MOCK_COMPANIONS;

  const rows = (await electron?.dbQuery(
    `SELECT * FROM companions ORDER BY is_built_in DESC, name ASC`,
    []
  )) as CompanionRow[];

  return (rows || []).map(toCompanion);
}

/** Fetch a single companion */
export async function fetchCompanion(id: string): Promise<Companion | null> {
  if (!isElectron) return MOCK_COMPANIONS.find((c) => c.id === id) ?? null;

  const rows = (await electron?.dbQuery(
    `SELECT * FROM companions WHERE id = ?`,
    [id]
  )) as CompanionRow[];

  if (!rows || rows.length === 0) return null;
  return toCompanion(rows[0]);
}

/** Toggle companion active state */
export async function toggleCompanionActive(id: string, isActive: boolean): Promise<void> {
  if (!isElectron) return;
  await electron?.dbExec(
    `UPDATE companions SET is_active = ?, updated_at = datetime('now') WHERE id = ?`,
    [isActive ? 1 : 0, id]
  );
}

/** Create a custom companion */
export async function createCompanion(companion: Omit<Companion, 'createdAt' | 'updatedAt'>): Promise<void> {
  if (!isElectron) return;
  await electron?.dbExec(
    `INSERT INTO companions (id, name, name_ar, description, description_ar, system_prompt, icon, is_built_in, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1)`,
    [
      companion.id, companion.name, companion.nameAr,
      companion.description, companion.descriptionAr,
      companion.systemPrompt, companion.icon,
    ]
  );
}

/** Update a custom companion */
export async function updateCompanion(
  id: string,
  updates: Partial<Pick<Companion, 'name' | 'nameAr' | 'description' | 'descriptionAr' | 'systemPrompt' | 'icon'>>
): Promise<void> {
  if (!isElectron) return;
  const fields: string[] = [];
  const params: unknown[] = [];
  if (updates.name !== undefined) { fields.push('name = ?'); params.push(updates.name); }
  if (updates.nameAr !== undefined) { fields.push('name_ar = ?'); params.push(updates.nameAr); }
  if (updates.description !== undefined) { fields.push('description = ?'); params.push(updates.description); }
  if (updates.descriptionAr !== undefined) { fields.push('description_ar = ?'); params.push(updates.descriptionAr); }
  if (updates.systemPrompt !== undefined) { fields.push('system_prompt = ?'); params.push(updates.systemPrompt); }
  if (updates.icon !== undefined) { fields.push('icon = ?'); params.push(updates.icon); }
  if (fields.length === 0) return;
  fields.push("updated_at = datetime('now')");
  params.push(id);
  await electron?.dbExec(`UPDATE companions SET ${fields.join(', ')} WHERE id = ?`, params);
}

/** Delete a custom companion (not built-in) */
export async function deleteCompanion(id: string): Promise<void> {
  if (!isElectron) return;
  await electron?.dbExec(`DELETE FROM companions WHERE id = ? AND is_built_in = 0`, [id]);
}

/** Get conversation count per companion */
export async function fetchCompanionStats(): Promise<Record<string, number>> {
  if (!isElectron) {
    return { 'meeting-coach': 3, 'strategic-advisor': 5, 'personal-assistant': 2, 'finance-advisor': 4, 'protocol-coach': 1 };
  }

  const rows = (await electron?.dbQuery(
    `SELECT companion_id, COUNT(*) as count FROM conversations WHERE companion_id IS NOT NULL GROUP BY companion_id`,
    []
  )) as { companion_id: string; count: number }[];

  const stats: Record<string, number> = {};
  (rows || []).forEach((r) => { stats[r.companion_id] = r.count; });
  return stats;
}
