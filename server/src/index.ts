
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { 
  createTaskInputSchema, 
  updateTaskStatusInputSchema, 
  deleteTaskInputSchema 
} from './schema';
import { createTask } from './handlers/create_task';
import { getTasks } from './handlers/get_tasks';
import { updateTaskStatus } from './handlers/update_task_status';
import { deleteTask } from './handlers/delete_task';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Create a new task
  createTask: publicProcedure
    .input(createTaskInputSchema)
    .mutation(({ input }) => createTask(input)),
  
  // Get all tasks
  getTasks: publicProcedure
    .query(() => getTasks()),
  
  // Update task status (mark as completed/pending)
  updateTaskStatus: publicProcedure
    .input(updateTaskStatusInputSchema)
    .mutation(({ input }) => updateTaskStatus(input)),
  
  // Delete a task
  deleteTask: publicProcedure
    .input(deleteTaskInputSchema)
    .mutation(({ input }) => deleteTask(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
