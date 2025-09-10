import { Board, IBoard } from '../models/board.model';

export const createBoard = async (
  boardData: { name: string },
  ownerId: string,
): Promise<IBoard> => {
  const newBoard = await Board.create({
    ...boardData,
    ownerId: ownerId,
    memberIds: [ownerId],
  });
  return newBoard;
};

export const getBoardByUserId = async (userId: string): Promise<IBoard[]> => {
  const boards = await Board.find({
    $or: [{ ownerId: userId }, { memberIds: userId }],
  });
  return boards;
};

export const getBoardById = async (boardId: string, userId: string) => {
  const board = await Board.findById(boardId);
  if (!board) {
    return null;
  }
  const isMember = board.memberIds.map((id) => id.toString().includes(userId));
  if (!isMember) {
    throw new Error('Forbidden');
  }
  return board;
};

export const updateBoard = async (
  boardId: string,
  userId: string,
  updateData: { name?: string },
) => {
  const board = await Board.findById(boardId);

  if (!board) {
    throw new Error('Not Found');
  }

  if (board.ownerId.toString() !== userId) {
    throw new Error('Forbidden');
  }

  if (updateData.name) {
    board.name = updateData.name;
  }

  await board.save();
  return board;
};

export const deleteBoard = async (boardId: string, userId: string) => {
  const board = await Board.findById(boardId);

  if (!board) {
    throw new Error('Not Found');
  }

  if (board.ownerId.toString() !== userId) {
    throw new Error('Forbidden');
  }
  await Board.findByIdAndDelete(board);
};
