import { useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'To Do' | 'In Progress' | 'Review' | 'Completed';
  assignedToId?: { _id: string; username: string; email: string };
  creatorId: { _id: string; username: string; email: string };
  position: number;
  createdAt: string;
}

export const useTasks = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // Fetch tasks
  const { data: tasks = [], isLoading: loading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await axios.get('/api/tasks', { withCredentials: true });
      return res.data;
    },
  });

  // Socket updates
  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = (newTask: Task) => {
      queryClient.setQueryData(['tasks'], (old: Task[] = []) => [newTask, ...old]);
    };

    const handleTaskUpdated = (updatedTask: Task) => {
       queryClient.setQueryData(['tasks'], (old: Task[] = []) => 
         old.map((t) => (t._id === updatedTask._id ? updatedTask : t))
       );
    };

    const handleTaskDeleted = (taskId: string) => {
      queryClient.setQueryData(['tasks'], (old: Task[] = []) => 
        old.filter((t) => t._id !== taskId)
      );
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);

    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
    };
  }, [socket, queryClient]);

  // Mutation for updating task (Optimistic)
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const res = await axios.put(`/api/tasks/${id}`, updates, { withCredentials: true });
      return res.data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      queryClient.setQueryData(['tasks'], (old: Task[] = []) => 
        old.map((t) => (t._id === id ? { ...t, ...updates } : t))
      );

      return { previousTasks };
    },
    onError: (_err, _newTodo, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return { 
    tasks, 
    loading, 
    updateTask: updateTaskMutation.mutate,
    updateTaskAsync: updateTaskMutation.mutateAsync 
  };
};
