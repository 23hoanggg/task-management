import { Document, Schema, model, Types } from 'mongoose';

export interface IBoardInvitation extends Document {
  boardId: Types.ObjectId;
  senderId: Types.ObjectId; 
  inviteeId: Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  type: 'request' | 'invite';
  createdAt: Date;
  updatedAt: Date;
}

const boardInvitationSchema = new Schema<IBoardInvitation>(
  {
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    inviteeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    type: {
      type: String,
      enum: ['request', 'invite'],
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const BoardInvitation = model<IBoardInvitation>('BoardInvitation', boardInvitationSchema);