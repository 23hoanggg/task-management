import { Board, IBoard } from '../models/board.model';
import { Types } from 'mongoose';

export const getUserRoleInBoard = (
  board: IBoard,
  userId: string,
): 'owner' | 'co-manager' | 'member' | null => {
  if (board.ownerId.toString() === userId) return 'owner';
  if (board.coManagerIds.some((id) => id.toString() === userId))
    return 'co-manager';
  if (board.memberIds.some((id) => id.toString() === userId)) return 'member';
  return null;
};

export const createBoard = async (
  boardData: { name: string; dueDate?: Date },
  ownerId: string,
): Promise<IBoard> => {
  const newBoard = await Board.create({
    ...boardData,
    ownerId: ownerId,
    coManagerIds: [],
    memberIds: [ownerId],
  });
  return newBoard;
};

// lay tat ca board ma user tham gia
export const getBoardByUserId = async (userId: string): Promise<IBoard[]> => {
  const boards = await Board.find({
    $or: [{ ownerId: userId }, { coManagerIds: userId }, { memberIds: userId }],
  });
  return boards;
};

// lay thong tin chi tiet 1 board
export const getBoardById = async (boardId: string, userId: string) => {
  const board = await Board.findById(boardId);
  if (!board) {
    return null;
  }
  const role = getUserRoleInBoard(board, userId);
  if (!role) {
    throw new Error('Forbidden');
  }
  return board;
};

export const updateBoard = async (
  boardId: string,
  userId: string,
  updateData: { name?: string; dueDate?: Date },
) => {
  const board = await Board.findById(boardId);

  if (!board) {
    throw new Error('Not Found');
  }

  const role = getUserRoleInBoard(board, userId);
  if (role === 'member') {
    throw new Error('Forbidden: Members cannot update the board');
  }

  Object.assign(board, updateData);
  await board.save();
  return board;
};

export const deleteBoard = async (boardId: string, userId: string) => {
  const board = await Board.findById(boardId);

  if (!board) {
    throw new Error('Not Found');
  }

  if (board.ownerId.toString() !== userId) {
    throw new Error('Forbidden: Only the board owner can delete the board');
  }
  await Board.findByIdAndDelete(boardId);
};

// get all members cua 1 board
export const getBoardMembers = async (boardId: string, userId: string) => {
  const board = await getBoardById(boardId, userId);

  if (!board) {
    throw new Error('Board not found');
  }

  await board.populate([
    { path: 'ownerId', select: 'fullName email _id' },
    { path: 'coManagerIds', select: 'fullName email _id' },
    { path: 'memberIds', select: 'fullName email _id' },
  ]);

  return {
    owner: board.ownerId,
    coManagers: board.coManagerIds,
    members: board.memberIds,
    totalMembers: board.memberIds.length,
  };
};

// add co-manager
export const addCoManager = async (
  boardId: string,
  targetUserId: string,
  userId: string,
) => {
  const board = await Board.findById(boardId);
  if (!board) throw new Error('Board not found');

  // check role board owner
  if (board.ownerId.toString() !== userId) {
    throw new Error('Forbidden: Only owner can assign co-managers');
  }

  const targetObjectId = new Types.ObjectId(targetUserId);
  if (!board.coManagerIds.includes(targetObjectId)) {
    board.coManagerIds.push(targetObjectId);
  }
  await board.save();
  return board;
};

// remove co-manager
export const removeCoManager = async (
  boardId: string,
  targetUserId: string,
  userId: string,
) => {
  const board = await Board.findById(boardId);
  if (!board) throw new Error('Board not found');

  // check role board owner
  if (board.ownerId.toString() !== userId) {
    throw new Error('Forbidden: Only owner can remove co-managers');
  }

  board.coManagerIds = board.coManagerIds.filter(
    (id) => id.toString() !== targetUserId,
  ) as any;
  await board.save();
  return board;
};
