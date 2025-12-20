import { Request, Response } from 'express';
import { ZodError } from 'zod';
import TaskService from '../services/task.service';
import { CreateTaskSchema, UpdateTaskSchema } from '../dtos/task.dto';

class TaskController {
  /**
   * Handles task creation request.
   * @route POST /api/tasks
   */
  async create(req: Request, res: Response) {
    try {
      const validatedData = CreateTaskSchema.parse(req.body);
      const task = await TaskService.createTask(req.user as string, validatedData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ message: (error as Error).message });
    }
  }

  /**
   * Retrieves tasks with optional filters.
   * @route GET /api/tasks
   */
  async getAll(req: Request, res: Response) {
    try {
      // Extract filters from query
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        assignedToId: req.query.assignedToId,
      };
      
      const tasks = await TaskService.getAllTasks(filters);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  /**
   * Retrieves a single task.
   * @route GET /api/tasks/:id
   */
  async getOne(req: Request, res: Response) {
    try {
      const task = await TaskService.getTask(req.params.id);
      res.json(task);
    } catch (error) {
      res.status(404).json({ message: 'Task not found' });
    }
  }

  /**
   * Handles task update.
   * @route PUT /api/tasks/:id
   */
  async update(req: Request, res: Response) {
    try {
      const validatedData = UpdateTaskSchema.parse(req.body);
      const task = await TaskService.updateTask(req.params.id, validatedData, req.user as string);
      res.json(task);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ errors: error.issues });
      }
      res.status(500).json({ message: (error as Error).message });
    }
  }

  /**
   * Handles task deletion.
   * @route DELETE /api/tasks/:id
   */
  async delete(req: Request, res: Response) {
    try {
      await TaskService.deleteTask(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}

export default new TaskController();
