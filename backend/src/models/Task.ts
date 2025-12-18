import mongoose, { Schema, Document } from 'mongoose';

export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent',
}

export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Review = 'Review',
  Completed = 'Completed',
}

export interface ITask extends Document {
  title: string;
  description?: string;
  dueDate: Date;
  priority: TaskPriority;
  status: TaskStatus;
  creatorId: mongoose.Types.ObjectId;
  assignedToId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema({
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: Object.values(TaskPriority), default: TaskPriority.Medium },
  status: { type: String, enum: Object.values(TaskStatus), default: TaskStatus.ToDo },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedToId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Indexes for common queries
TaskSchema.index({ assignedToId: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ dueDate: 1 });

export default mongoose.model<ITask>('Task', TaskSchema);
