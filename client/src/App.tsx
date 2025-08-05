
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, CheckCircle, Clock } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Task, CreateTaskInput } from '../../server/src/schema';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Load tasks on component mount
  const loadTasks = useCallback(async () => {
    try {
      const result = await trpc.getTasks.query();
      setTasks(result);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Handle creating a new task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsLoading(true);
    try {
      const taskInput: CreateTaskInput = { title: newTaskTitle.trim() };
      const newTask = await trpc.createTask.mutate(taskInput);
      setTasks((prev: Task[]) => [newTask, ...prev]);
      setNewTaskTitle('');
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle toggling task status
  const handleToggleTask = async (taskId: number, currentStatus: 'pending' | 'completed') => {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    
    try {
      const updatedTask = await trpc.updateTaskStatus.mutate({
        id: taskId,
        status: newStatus
      });
      
      setTasks((prev: Task[]) =>
        prev.map((task: Task) =>
          task.id === taskId ? { ...task, status: newStatus, updated_at: updatedTask.updated_at } : task
        )
      );
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  // Handle deleting a task
  const handleDeleteTask = async (taskId: number) => {
    try {
      await trpc.deleteTask.mutate({ id: taskId });
      setTasks((prev: Task[]) => prev.filter((task: Task) => task.id !== taskId));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const completedTasks = tasks.filter((task: Task) => task.status === 'completed');
  const pendingTasks = tasks.filter((task: Task) => task.status === 'pending');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ✅ 待办事项
          </h1>
          <p className="text-gray-600">保持专注，事半功倍！</p>
        </div>

        {/* Add new task form */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="w-5 h-5 text-blue-600" />
              Add New Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTask} className="flex gap-2">
              <Input
                value={newTaskTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewTaskTitle(e.target.value)
                }
                placeholder="有什么要做的？🚀"
                className="flex-1 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                maxLength={500}
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !newTaskTitle.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                {isLoading ? '⏳' : '➕'} Add
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tasks summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {pendingTasks.length}
              </div>
              <div className="text-sm text-orange-600 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                Pending
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {completedTasks.length}
              </div>
              <div className="text-sm text-green-600 flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Completed
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks list */}
        {tasks.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">No tasks yet!</p>
              <p className="text-gray-400">Add your first task above to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tasks.map((task: Task) => (
              <Card
                key={task.id}
                className={`shadow-md border-0 transition-all duration-200 hover:shadow-lg ${
                  task.status === 'completed'
                    ? 'bg-green-50/80 backdrop-blur-sm'
                    : 'bg-white/80 backdrop-blur-sm'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={task.status === 'completed'}
                      onCheckedChange={() => handleToggleTask(task.id, task.status)}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium transition-all duration-200 ${
                          task.status === 'completed'
                            ? 'line-through text-gray-500'
                            : 'text-gray-800'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        Created: {task.created_at.toLocaleDateString()} at{' '}
                        {task.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <Badge
                      variant={task.status === 'completed' ? 'secondary' : 'default'}
                      className={
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-orange-100 text-orange-700 border-orange-200'
                      }
                    >
                      {task.status === 'completed' ? '✅ Done' : '⏳ Pending'}
                    </Badge>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          🎯 Stay focused, stay productive!
        </div>
      </div>
    </div>
  );
}

export default App;
