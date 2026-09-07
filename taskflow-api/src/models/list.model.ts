import { Document, Schema, model, Types } from 'mongoose';

export interface IList extends Document {
  name: string;
  description?: string; 
  boardId: Types.ObjectId;
  order: number;
  dueDate?: Date; 
  createdAt: Date;
  updatedAt: Date;
}

const listSchema = new Schema<IList>(
  {
    name: {
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
    order: {
      type: Number,
      required: true,
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

export const List = model<IList>('List', listSchema);