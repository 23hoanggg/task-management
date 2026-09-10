import { User } from '../models/user.model';
import { Board } from '../models/board.model';

export const findUserById = async (id: string) => {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    throw new Error('Lỗi khi tìm người dùng theo ID');
  }
};

export const searchUsersForInvitation = async (
  boardId: string,
  searchQuery: string,
) => {
  const board = await Board.findById(boardId).select('memberIds');

  if (!board) {
    throw new Error('Board not found');
  }

  const users = await User.find({
    email: { $regex: searchQuery, $options: 'i' },
    _id: { $nin: board.memberIds },
  })
    .select('_id fullName email ')
    .limit(5);
  return users;
};
