import TaskRepository from '../repositories/task.repo';
import { CreateTaskDTO, UpdateTaskDTO } from '../dtos/task.dto';
import SocketService from '../socket';
import NotificationService from './notification.service';
import AuditLog from '../models/AuditLog'; 

class TaskService {
  /**
   * Creates a new task, emits a socket event, and notifies the assignee if applicable.
   * @param {string} userId - The ID of the user creating the task.
   * @param {CreateTaskDTO} data - The task data transfer object.
   * @returns {Promise<ITask>} The created task.
   */
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

  /**
   * Retrieves a task by its ID.
   * @param {string} id - The task ID.
   * @returns {Promise<ITask>} The task document.
   * @throws {Error} If task is not found.
   */
  async getTask(id: string) {
    const task = await TaskRepository.findById(id);
    if (!task) throw new Error('Task not found');
    return task;
  }

  /**
   * Updates an existing task, handling optimistic updates, socket emission, and notifications.
   * @param {string} id - The task ID to update.
   * @param {UpdateTaskDTO} data - The partial data to update.
   * @param {string} userId - The ID of the user performing the update.
   * @returns {Promise<ITask|null>} The updated task.
   * @throws {Error} If task is not found.
   */
  async updateTask(id: string, data: UpdateTaskDTO, userId: string) {
    const task = await TaskRepository.findById(id);
    if (!task) throw new Error('Task not found');

    // Simple permission check: needed? 
    // Usually anyone can update or just creator/assignee. Let's allow all auth users for collaboration.
    
    const updatedTask = await TaskRepository.update(id, data);
    
    // Audit Logging for Status Change
    if (data.status && data.status !== task.status) {
       await AuditLog.create({
         taskId: id,
         userId,
         action: 'STATUS_CHANGE',
         details: `Status changed from ${task.status} to ${data.status}`
       });
    }

    SocketService.getIO().emit('task:updated', updatedTask);

    // Check for reassignment
    if (data.assignedToId && data.assignedToId !== task.assignedToId?.toString() && data.assignedToId !== userId) {
       await this.notifyAssignee(data.assignedToId, task._id as unknown as string, `You have been assigned to task: ${updatedTask?.title}`);
    }

    return updatedTask;
  }

  /**
   * Deletes a task by ID and emits a socket event.
   * @param {string} id - The ID of the task to delete.
   * @returns {Promise<ITask|null>} The deleted task document.
   */
  async deleteTask(id: string) {
    const deletedTask = await TaskRepository.delete(id);
    if (deletedTask) {
        SocketService.getIO().emit('task:deleted', id);
    }
    return deletedTask;
  }

  /**
   * Retrieves all tasks matching the given filters.
   * @param {any} filters - Filtering criteria.
   * @returns {Promise<ITask[]>} A list of tasks.
   */
  async getAllTasks(filters: any) {
    return TaskRepository.findAll(filters);
  }

  /**
   * Helper to create a persistent notification and emit a real-time event.
   * @param {string} userId - Recipient user ID.
   * @param {string} taskId - Associated task ID.
   * @param {string} message - Notification message.
   */
  private async notifyAssignee(userId: string, taskId: string, message: string) {
    // Create persistent notification using service
    await NotificationService.createNotification(userId, taskId, message);

    // Real-time socket event to specific user room
    SocketService.getIO().to(userId).emit('notification:new', { message, taskId });
  }
}

export default new TaskService();
