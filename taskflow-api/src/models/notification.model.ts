import { Document, Schema, model, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId; // id nguoi nhan
  title: string; 
  content: string; 
  targetUrl?: string; 
  isRead: boolean;
  type: 'mention' | 'task_assigned' | 'board_invite' | 'deadline' | 'system';
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    targetUrl: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ['mention', 'task_assigned', 'board_invite', 'deadline', 'system'],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Notification = model<INotification>('Notification', notificationSchema);