
import { z } from 'zod';

// Task status enum
export const taskStatusSchema = z.enum(['pending', 'completed']);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

// Task schema
export const taskSchema = z.object({
  id: z.number(),
  title: z.string(),
  status: taskStatusSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Task = z.infer<typeof taskSchema>;

// Input schema for creating tasks
export const createTaskInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long')
});

export type CreateTaskInput = z.infer<typeof createTaskInputSchema>;

// Input schema for updating task status
export const updateTaskStatusInputSchema = z.object({
  id: z.number(),
  status: taskStatusSchema
});

export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusInputSchema>;

// Input schema for deleting tasks
export const deleteTaskInputSchema = z.object({
  id: z.number()
});

export type DeleteTaskInput = z.infer<typeof deleteTaskInputSchema>;
