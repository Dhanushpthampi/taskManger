import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: string;
  details: string;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema({
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  details: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
