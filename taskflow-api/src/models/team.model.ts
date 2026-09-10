import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  boardId: Types.ObjectId;
  memberIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
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
    memberIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Team = mongoose.model<ITeam>('Team', teamSchema);
