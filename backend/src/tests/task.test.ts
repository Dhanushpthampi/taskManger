import mongoose from 'mongoose';
import Task, { TaskPriority, TaskStatus } from '../models/Task';

describe('Task Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('create & save task successfully', async () => {
    const validTask = new Task({
      title: 'Test Task',
      dueDate: new Date(),
      priority: TaskPriority.Medium,
      status: TaskStatus.ToDo,
      creatorId: new mongoose.Types.ObjectId(),
    });
    const savedTask = await validTask.save();
    
    expect(savedTask._id).toBeDefined();
    expect(savedTask.title).toBe('Test Task');
    expect(savedTask.priority).toBe(TaskPriority.Medium);
  });

  it('insert task without required field should fail', async () => {
    const taskWithoutTitle = new Task({
      dueDate: new Date(),
      creatorId: new mongoose.Types.ObjectId(),
    });
    let err;
    try {
      await taskWithoutTitle.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });
});
