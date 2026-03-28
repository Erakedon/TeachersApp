import { type SQLiteDatabase } from 'expo-sqlite';

import { type ChildProfile, type ConditionType } from '@/types';

// ---------------------------------------------------------------------------
// Row shape returned from the DB
// ---------------------------------------------------------------------------

interface ProfileRow {
  id: string;
  name: string;
  age: number | null;
  condition: string;
  notes: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

function rowToProfile(row: ProfileRow): ChildProfile {
  return {
    id: row.id,
    name: row.name,
    age: row.age ?? undefined,
    condition: row.condition as ConditionType,
    notes: row.notes ?? undefined,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export class ChildProfileRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async getAll(): Promise<ChildProfile[]> {
    const rows = await this.db.getAllAsync<ProfileRow>(
      'SELECT * FROM child_profiles ORDER BY created_at DESC',
    );
    return rows.map(rowToProfile);
  }

  async getActiveProfiles(): Promise<ChildProfile[]> {
    const rows = await this.db.getAllAsync<ProfileRow>(
      'SELECT * FROM child_profiles WHERE is_active = 1 ORDER BY created_at DESC',
    );
    return rows.map(rowToProfile);
  }

  async insert(profile: Omit<ChildProfile, 'createdAt' | 'updatedAt'>): Promise<void> {
    const now = new Date().toISOString();
    await this.db.runAsync(
      `INSERT INTO child_profiles
         (id, name, age, condition, notes, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        profile.id,
        profile.name,
        profile.age ?? null,
        profile.condition,
        profile.notes ?? null,
        profile.isActive ? 1 : 0,
        now,
        now,
      ],
    );
  }

  async toggleActive(id: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db.runAsync(
      `UPDATE child_profiles
       SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END,
           updated_at = ?
       WHERE id = ?`,
      [now, id],
    );
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    const now = new Date().toISOString();
    await this.db.runAsync(
      'UPDATE child_profiles SET is_active = ?, updated_at = ? WHERE id = ?',
      [isActive ? 1 : 0, now, id],
    );
  }
}
