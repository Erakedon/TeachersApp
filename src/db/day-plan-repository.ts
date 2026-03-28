import { type SQLiteDatabase } from 'expo-sqlite';

import { type DayPlan } from '@/types';

interface DayPlanRow {
  id: string;
  date: string;
  topic: string | null;
  raw_json: string;
  created_at: string;
}

function rowToPlan(row: DayPlanRow): DayPlan {
  return {
    id: row.id,
    date: row.date,
    topic: row.topic ?? undefined,
    rawJson: row.raw_json,
    createdAt: row.created_at,
  };
}

export class DayPlanRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async getByDate(date: string): Promise<DayPlan | null> {
    const row = await this.db.getFirstAsync<DayPlanRow>(
      'SELECT * FROM day_plans WHERE date = ?',
      [date],
    );
    return row ? rowToPlan(row) : null;
  }

  /** Returns all stored YYYY-MM-DD date strings that have a saved plan. */
  async getAllDates(): Promise<string[]> {
    const rows = await this.db.getAllAsync<{ date: string }>(
      'SELECT date FROM day_plans ORDER BY date ASC',
    );
    return rows.map((r) => r.date);
  }

  async save(plan: DayPlan): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO day_plans (id, date, topic, raw_json, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(date) DO UPDATE
         SET topic    = excluded.topic,
             raw_json = excluded.raw_json`,
      [plan.id, plan.date, plan.topic ?? null, plan.rawJson, plan.createdAt],
    );
  }

  async delete(date: string): Promise<void> {
    await this.db.runAsync('DELETE FROM day_plans WHERE date = ?', [date]);
  }
}
