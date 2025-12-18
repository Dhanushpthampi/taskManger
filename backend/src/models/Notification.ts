import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
