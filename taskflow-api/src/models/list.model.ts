import { Document, Schema, model, Types } from 'mongoose';

export interface IList extends Document {
  name: string;
  boardId: Types.ObjectId;
  order: number;
}

const listSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const List = model<IList>('List', listSchema);
