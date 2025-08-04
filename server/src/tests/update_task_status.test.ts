
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type UpdateTaskStatusInput } from '../schema';
import { updateTaskStatus } from '../handlers/update_task_status';
import { eq } from 'drizzle-orm';

describe('updateTaskStatus', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update task status from pending to completed', async () => {
    // Create a test task directly in database
    const createResult = await db.insert(tasksTable)
      .values({
        title: 'Test Task',
        status: 'pending'
      })
      .returning()
      .execute();

    const createdTask = createResult[0];

    // Update the task status
    const updateInput: UpdateTaskStatusInput = {
      id: createdTask.id,
      status: 'completed'
    };

    const result = await updateTaskStatus(updateInput);

    // Verify the update
    expect(result.id).toEqual(createdTask.id);
    expect(result.title).toEqual('Test Task');
    expect(result.status).toEqual('completed');
    expect(result.created_at).toEqual(createdTask.created_at);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(createdTask.updated_at.getTime());
  });

  it('should update task status from completed to pending', async () => {
    // Create a test task directly in database
    const createResult = await db.insert(tasksTable)
      .values({
        title: 'Test Task',
        status: 'completed'
      })
      .returning()
      .execute();

    const createdTask = createResult[0];

    // Update back to pending
    const updateInput: UpdateTaskStatusInput = {
      id: createdTask.id,
      status: 'pending'
    };

    const result = await updateTaskStatus(updateInput);

    expect(result.status).toEqual('pending');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated task to database', async () => {
    // Create a test task directly in database
    const createResult = await db.insert(tasksTable)
      .values({
        title: 'Database Test Task',
        status: 'pending'
      })
      .returning()
      .execute();

    const createdTask = createResult[0];

    // Update the task status
    const updateInput: UpdateTaskStatusInput = {
      id: createdTask.id,
      status: 'completed'
    };

    await updateTaskStatus(updateInput);

    // Query database to verify the update
    const tasks = await db.select()
      .from(tasksTable)
      .where(eq(tasksTable.id, createdTask.id))
      .execute();

    expect(tasks).toHaveLength(1);
    expect(tasks[0].status).toEqual('completed');
    expect(tasks[0].updated_at).toBeInstanceOf(Date);
    expect(tasks[0].updated_at.getTime()).toBeGreaterThan(createdTask.updated_at.getTime());
  });

  it('should throw error for non-existent task', async () => {
    const updateInput: UpdateTaskStatusInput = {
      id: 99999,
      status: 'completed'
    };

    expect(updateTaskStatus(updateInput)).rejects.toThrow(/not found/i);
  });
});
