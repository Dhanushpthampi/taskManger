import { z } from 'zod';
import { TaskPriority } from '../models/Task';

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  dueDate: z.string().transform((str) => new Date(str)), // Accept string, convert to Date
  priority: z.nativeEnum(TaskPriority).optional(),
  assignedToId: z.string().optional(), // ObjectId as string
  position: z.number().optional(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  dueDate: z.string().transform((str) => new Date(str)).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  status: z.enum(['To Do', 'In Progress', 'Review', 'Completed']).optional(),
  assignedToId: z.string().optional(),
  position: z.number().optional(),
});

export type CreateTaskDTO = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof UpdateTaskSchema>;
