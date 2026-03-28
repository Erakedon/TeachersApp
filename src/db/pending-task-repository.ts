import { type SQLiteDatabase } from "expo-sqlite";

import { type PendingTask, type TaskPriority } from "@/types";

interface TaskRow {
  id: string;
  description: string;
  priority: string;
  is_done: number;
  created_at: string;
}

function rowToTask(row: TaskRow): PendingTask {
  return {
    id: row.id,
    description: row.description,
    priority: row.priority as TaskPriority,
    isDone: row.is_done === 1,
    createdAt: row.created_at,
  };
}

export class PendingTaskRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async getAll(): Promise<PendingTask[]> {
    const rows = await this.db.getAllAsync<TaskRow>(
      "SELECT * FROM pending_tasks ORDER BY created_at ASC",
    );
    return rows.map(rowToTask);
  }

  async getIncomplete(): Promise<PendingTask[]> {
    const rows = await this.db.getAllAsync<TaskRow>(
      "SELECT * FROM pending_tasks WHERE is_done = 0 ORDER BY created_at ASC",
    );
    return rows.map(rowToTask);
  }

  async insert(task: Omit<PendingTask, "createdAt">): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO pending_tasks (id, description, priority, is_done, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        task.id,
        task.description,
        task.priority,
        task.isDone ? 1 : 0,
        new Date().toISOString(),
      ],
    );
  }

  async markDone(id: string): Promise<void> {
    await this.db.runAsync(
      "UPDATE pending_tasks SET is_done = 1 WHERE id = ?",
      [id],
    );
  }
}
