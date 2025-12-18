import TaskRepository from '../repositories/task.repo';
import { CreateTaskDTO, UpdateTaskDTO } from '../dtos/task.dto';
import SocketService from '../socket';
import NotificationService from './notification.service'; 

class TaskService {
  async createTask(userId: string, data: CreateTaskDTO) {
    const task = await TaskRepository.create({ ...data, creatorId: userId });
    
    // Notify all clients about new task (or just relevant ones, but for now broadcast)
    SocketService.getIO().emit('task:created', task);

    // If assigned to someone else, notify them
    if (data.assignedToId && data.assignedToId !== userId) {
      await this.notifyAssignee(data.assignedToId, task._id as unknown as string, `You have been assigned to task: ${task.title}`);
    }

    return task;
  }

  async getTask(id: string) {
    const task = await TaskRepository.findById(id);
    if (!task) throw new Error('Task not found');
    return task;
  }

  async updateTask(id: string, data: UpdateTaskDTO, userId: string) {
    const task = await TaskRepository.findById(id);
    if (!task) throw new Error('Task not found');

    // Simple permission check: needed? 
    // Usually anyone can update or just creator/assignee. Let's allow all auth users for collaboration.
    
    const updatedTask = await TaskRepository.update(id, data);
    
    SocketService.getIO().emit('task:updated', updatedTask);

    // Check for reassignment
    if (data.assignedToId && data.assignedToId !== task.assignedToId?.toString() && data.assignedToId !== userId) {
       await this.notifyAssignee(data.assignedToId, task._id as unknown as string, `You have been assigned to task: ${updatedTask?.title}`);
    }

    return updatedTask;
  }

  async deleteTask(id: string) {
    const deletedTask = await TaskRepository.delete(id);
    if (deletedTask) {
        SocketService.getIO().emit('task:deleted', id);
    }
    return deletedTask;
  }

  async getAllTasks(filters: any) {
    return TaskRepository.findAll(filters);
  }

  private async notifyAssignee(userId: string, taskId: string, message: string) {
    // Create persistent notification using service
    await NotificationService.createNotification(userId, taskId, message);

    // Real-time socket event to specific user room
    SocketService.getIO().to(userId).emit('notification:new', { message, taskId });
  }
}

export default new TaskService();
