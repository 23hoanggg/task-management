import { Document, Schema, model, Types } from 'mongoose';

export interface IBoard extends Document {
  name: string;
  ownerId: Types.ObjectId;
  coManagerIds: Types.ObjectId[];
  memberIds: Types.ObjectId[];
  dueDate?: Date; 
  createdAt: Date;
  updatedAt: Date;
}

const boardSchema = new Schema<IBoard>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coManagerIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    memberIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Board = model<IBoard>('Board', boardSchema);