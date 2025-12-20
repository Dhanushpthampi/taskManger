import mongoose, { Schema, Document } from 'mongoose';

/**
 * Enum for Task Priority levels.
 */
export enum TaskPriority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent',
}

/**
 * Enum for Task Status values.
 */
export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Review = 'Review',
  Completed = 'Completed',
}

/**
 * Interface representing a Task document in MongoDB.
 * @interface ITask
 */
export interface ITask extends Document {
  /** Title of the task */
  title: string;
  /** Detailed description of the task */
  description?: string;
  /** Due date for the task */
  dueDate: Date;
  /** Priority level of the task */
  priority: TaskPriority;
  /** Current status of the task */
  status: TaskStatus;
  /** Ranking position for drag-and-drop ordering */
  position: number;
  /** ID of the user who created the task */
  creatorId: mongoose.Types.ObjectId;
  /** ID of the user assigned to the task */
  assignedToId?: mongoose.Types.ObjectId;
  /** Timestamp of creation */
  createdAt: Date;
  /** Timestamp of last update */
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema({
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: Object.values(TaskPriority), default: TaskPriority.Medium },
  status: { type: String, enum: Object.values(TaskStatus), default: TaskStatus.ToDo },
  position: { type: Number, default: 0 },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedToId: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Indexes for common queries
TaskSchema.index({ assignedToId: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ position: 1 });
TaskSchema.index({ dueDate: 1 });

export default mongoose.model<ITask>('Task', TaskSchema);
