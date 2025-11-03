import { Board, IBoard } from '../models/board.model';
import { User } from '../models/user.model';

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

export const getBoardMembers = async (boardId: string, userId: string) => {
  // 1. Kiểm tra quyền truy cập: Dùng lại hàm getBoardById
  const board = await getBoardById(boardId, userId);

  if (!board) {
    throw new Error('Board not found');
  }

  // 2. Lấy thông tin chi tiết của các thành viên
  await board.populate({
    path: 'memberIds',
    select: 'fullName email _id', // Chỉ lấy các trường này
  });

  return board.memberIds;
};

export const addMemberToBoard = async (
  boardId: string,
  email: string,
  userId: string,
) => {
  const board = await Board.findById(boardId);
  if (!board) {
    throw new Error('Board not found');
  }

  if (board.ownerId.toString() !== userId) {
    throw new Error('Forbidden: Only the board owner can add members');
  }

  const userToAdd = await User.findOne({ email });
  if (!userToAdd) {
    throw new Error('User not found with this email');
  }

  const isAlreadyMember = board.memberIds.some(
    (memberId) => memberId.toString() === (userToAdd as any)._id.toString(),
  );
  if (isAlreadyMember) {
    throw new Error('User is already a member of this board');
  }

  board.memberIds.push((userToAdd as any)._id);

  await board.save();
  return board;
};
