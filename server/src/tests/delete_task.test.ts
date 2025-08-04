
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type DeleteTaskInput } from '../schema';
import { deleteTask } from '../handlers/delete_task';
import { eq } from 'drizzle-orm';

describe('deleteTask', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing task', async () => {
    // Create a test task first
    const insertResult = await db.insert(tasksTable)
      .values({
        title: 'Task to delete',
        status: 'pending'
      })
      .returning()
      .execute();

    const taskId = insertResult[0].id;

    // Delete the task
    const input: DeleteTaskInput = { id: taskId };
    const result = await deleteTask(input);

    // Should return success
    expect(result.success).toBe(true);

    // Verify task is deleted from database
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, taskId))
      .execute();

    expect(tasks).toHaveLength(0);
  });

  it('should return false for non-existent task', async () => {
    // Try to delete a task that doesn't exist
    const input: DeleteTaskInput = { id: 999 };
    const result = await deleteTask(input);

    // Should return false since no rows were affected
    expect(result.success).toBe(false);
  });

  it('should not affect other tasks', async () => {
    // Create multiple test tasks
    const insertResult = await db.insert(tasksTable)
      .values([
        { title: 'Task 1', status: 'pending' },
        { title: 'Task 2', status: 'completed' },
        { title: 'Task 3', status: 'pending' }
      ])
      .returning()
      .execute();

    const taskToDelete = insertResult[1].id; // Delete middle task

    // Delete one task
    const input: DeleteTaskInput = { id: taskToDelete };
    const result = await deleteTask(input);

    expect(result.success).toBe(true);

    // Verify only the specified task was deleted
    const remainingTasks = await db.select()
      .from(tasksTable)
      .execute();

    expect(remainingTasks).toHaveLength(2);
    expect(remainingTasks.map(t => t.id)).not.toContain(taskToDelete);
    expect(remainingTasks.map(t => t.title)).toEqual(['Task 1', 'Task 3']);
  });
});
