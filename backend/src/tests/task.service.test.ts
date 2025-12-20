
import TaskService from '../services/task.service';
import TaskRepository from '../repositories/task.repo';
import SocketService from '../socket';
import NotificationService from '../services/notification.service';
import { CreateTaskDTO, UpdateTaskDTO } from '../dtos/task.dto';
import { TaskStatus, TaskPriority } from '../models/Task';

// Mock dependencies
jest.mock('../repositories/task.repo');
jest.mock('../socket');
jest.mock('../services/notification.service');

describe('TaskService Unit Tests', () => {
    let mockEmit: any;
    let mockTo: any;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockEmit = jest.fn();
        mockTo = jest.fn().mockReturnValue({ emit: mockEmit });
        
        // Mock SocketService.getIO
        (SocketService.getIO as jest.Mock).mockReturnValue({
            emit: mockEmit,
            to: mockTo
        });
    });

    it('should create a task and emit "task:created" event', async () => {
        const userId = 'user123';
        const taskData: CreateTaskDTO = {
            title: 'New Task',
            dueDate: new Date(),
            priority: TaskPriority.Medium
        };

        const createdTask = { _id: 'task123', ...taskData, creatorId: userId };
        (TaskRepository.create as jest.Mock).mockResolvedValue(createdTask);

        const result = await TaskService.createTask(userId, taskData);

        expect(TaskRepository.create).toHaveBeenCalledWith({ ...taskData, creatorId: userId });
        expect(mockEmit).toHaveBeenCalledWith('task:created', createdTask);
        expect(result).toEqual(createdTask);
    });

    it('should notify assignee when task is assigned to a different user', async () => {
        const userId = 'creator123';
        const assigneeId = 'assignee456';
        const taskData: CreateTaskDTO = {
            title: 'Assigned Task',
            dueDate: new Date(),
            assignedToId: assigneeId
        };

        const createdTask = { _id: 'task123', ...taskData, creatorId: userId };
        (TaskRepository.create as jest.Mock).mockResolvedValue(createdTask);

        await TaskService.createTask(userId, taskData);

        expect(NotificationService.createNotification).toHaveBeenCalledWith(
            assigneeId, 
            'task123', 
            expect.stringContaining('You have been assigned')
        );
        expect(mockTo).toHaveBeenCalledWith(assigneeId);
        expect(mockEmit).toHaveBeenCalledWith('notification:new', expect.any(Object));
    });

    it('should update task and emit "task:updated" event', async () => {
        const taskId = 'task123';
        const userId = 'user123';
        const updateData: UpdateTaskDTO = { status: TaskStatus.Completed };
        
        const existingTask = { _id: taskId, assignedToId: userId };
        const updatedTask = { ...existingTask, ...updateData };

        (TaskRepository.findById as jest.Mock).mockResolvedValue(existingTask);
        (TaskRepository.update as jest.Mock).mockResolvedValue(updatedTask);

        const result = await TaskService.updateTask(taskId, updateData, userId);

        expect(TaskRepository.update).toHaveBeenCalledWith(taskId, updateData);
        expect(mockEmit).toHaveBeenCalledWith('task:updated', updatedTask);
        expect(result).toEqual(updatedTask);
    });

    it('should throw error if task to update is not found', async () => {
        (TaskRepository.findById as jest.Mock).mockResolvedValue(null);

        await expect(TaskService.updateTask('invalidId', {}, 'user1')).rejects.toThrow('Task not found');
    });
});
