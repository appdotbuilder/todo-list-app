
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { getTasks } from '../handlers/get_tasks';

describe('getTasks', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no tasks exist', async () => {
    const result = await getTasks();
    expect(result).toEqual([]);
  });

  it('should return all tasks ordered by creation date (newest first)', async () => {
    // Create test tasks with slight delay to ensure different timestamps
    const task1 = await db.insert(tasksTable)
      .values({
        title: 'First Task',
        status: 'pending'
      })
      .returning()
      .execute();

    // Small delay to ensure different created_at timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const task2 = await db.insert(tasksTable)
      .values({
        title: 'Second Task',
        status: 'completed'
      })
      .returning()
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(2);
    
    // Should be ordered by created_at descending (newest first)
    expect(result[0].title).toEqual('Second Task');
    expect(result[0].status).toEqual('completed');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    expect(result[1].title).toEqual('First Task');
    expect(result[1].status).toEqual('pending');
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);
    expect(result[1].updated_at).toBeInstanceOf(Date);

    // Verify ordering by date
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should return tasks with all required fields', async () => {
    await db.insert(tasksTable)
      .values({
        title: 'Test Task',
        status: 'pending'
      })
      .execute();

    const result = await getTasks();

    expect(result).toHaveLength(1);
    const task = result[0];

    expect(task.id).toBeDefined();
    expect(typeof task.id).toBe('number');
    expect(task.title).toEqual('Test Task');
    expect(task.status).toEqual('pending');
    expect(task.created_at).toBeInstanceOf(Date);
    expect(task.updated_at).toBeInstanceOf(Date);
  });
});
