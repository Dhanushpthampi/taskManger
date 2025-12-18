import Task, { ITask, TaskStatus, TaskPriority } from '../models/Task';
import { CreateTaskDTO, UpdateTaskDTO } from '../dtos/task.dto';

interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  creatorId?: string;
}

class TaskRepository {
  async create(data: CreateTaskDTO & { creatorId: string }): Promise<ITask> {
    const task = new Task(data);
    return task.save();
  }

  async findById(id: string): Promise<ITask | null> {
    return Task.findById(id).populate('assignedToId', 'username email').populate('creatorId', 'username email');
  }

  async update(id: string, data: UpdateTaskDTO): Promise<ITask | null> {
    return Task.findByIdAndUpdate(id, data, { new: true }).populate('assignedToId', 'username email');
  }

  async delete(id: string): Promise<ITask | null> {
    return Task.findByIdAndDelete(id);
  }

  async findAll(filters: TaskFilters): Promise<ITask[]> {
    const query: any = {};
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.assignedToId) query.assignedToId = filters.assignedToId;
    if (filters.creatorId) query.creatorId = filters.creatorId;

    return Task.find(query)
      .sort({ dueDate: 1 }) // Sort by due date ascending
      .populate('assignedToId', 'username email')
      .populate('creatorId', 'username email');
  }
}

export default new TaskRepository();
