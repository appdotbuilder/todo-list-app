
import { db } from '../db';
import { tasksTable } from '../db/schema';
import { type CreateTaskInput, type Task } from '../schema';

export const createTask = async (input: CreateTaskInput): Promise<Task> => {
  try {
    // Insert task record
    const result = await db.insert(tasksTable)
      .values({
        title: input.title,
        status: 'pending', // Default status
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning()
      .execute();

    const task = result[0];
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      created_at: task.created_at,
      updated_at: task.updated_at
    };
  } catch (error) {
    console.error('Task creation failed:', error);
    throw error;
  }
};
