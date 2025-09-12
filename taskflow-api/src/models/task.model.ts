import { Document, Schema, model, Types } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  boardId: Types.ObjectId;
  listId: Types.ObjectId;
  ownerId: Types.ObjectId;
  assigneeId?: Types.ObjectId;
  order: number;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    listId: {
      type: Schema.Types.ObjectId,
      ref: 'List',
      required: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    order: {
      type: Number,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Task = model<ITask>('Task', taskSchema);
