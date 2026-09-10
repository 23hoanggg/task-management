import { Board, IBoard } from '../models/board.model';
import { Team } from '../models/team.model';
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
    memberIds: [],
  });
  return newBoard;
};

// Lấy tất cả board mà user tham gia
export const getBoardByUserId = async (userId: string): Promise<IBoard[]> => {
  const boards = await Board.find({
    $or: [{ ownerId: userId }, { coManagerIds: userId }, { memberIds: userId }],
  });
  return boards;
};

// Lấy thông tin chi tiết 1 board
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

// Lấy danh sách thành viên kèm theo nhóm của họ
export const getBoardMembers = async (boardId: string, userId: string) => {
  const board = await getBoardById(boardId, userId);

  if (!board) {
    throw new Error('Board not found');
  }

  // Populate thông tin chi tiết của người dùng
  await board.populate([
    { path: 'ownerId', select: 'fullName email _id' },
    { path: 'coManagerIds', select: 'fullName email _id' },
    { path: 'memberIds', select: 'fullName email _id' },
  ]);

  // Lấy toàn bộ các team trong bảng
  const teams = await Team.find({ boardId }).select('_id name memberIds');

  // Hàm đính kèm team vào từng user
  const attachTeamsToUser = (user: any) => {
    if (!user) return null;

    const userRaw =
      typeof user.toObject === 'function' ? user.toObject() : user;
    const currentUserId = userRaw._id.toString();

    const userTeams = teams
      .filter((team) =>
        team.memberIds.some((mId: any) => mId.toString() === currentUserId),
      )
      .map((team) => ({ _id: team._id, name: team.name }));

    return { ...userRaw, teams: userTeams };
  };

  const ownerData = attachTeamsToUser(board.ownerId);
  const ownerIdStr = ownerData?._id.toString();

  // Co-managers: kh lay owner
  const rawCoManagers = (board.coManagerIds as any[]) || [];
  const validCoManagers = rawCoManagers
    .filter((m) => m && m._id.toString() !== ownerIdStr)
    .map(attachTeamsToUser)
    .filter(Boolean);

  const validCoManagerIds = validCoManagers.map((m: any) => m._id.toString());

  // Members: khong lay owner hoac co-manager
  const rawMembers = (board.memberIds as any[]) || [];
  const validMembers = rawMembers
    .filter((m) => {
      if (!m) return false;
      const idStr = m._id.toString();
      return idStr !== ownerIdStr && !validCoManagerIds.includes(idStr);
    })
    .map(attachTeamsToUser)
    .filter(Boolean);

  return {
    owner: ownerData,
    coManagers: validCoManagers,
    members: validMembers,
    totalMembers: 1 + validCoManagers.length + validMembers.length,
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

  if (board.ownerId.toString() !== userId) {
    throw new Error('Forbidden: Only owner can assign co-managers');
  }

  const targetObjectId = new Types.ObjectId(targetUserId);

  //Thêm vào coManagerIds
  if (!board.coManagerIds.includes(targetObjectId)) {
    board.coManagerIds.push(targetObjectId);
  }

  //Rút khỏi memberIds
  board.memberIds = board.memberIds.filter(
    (id) => id.toString() !== targetUserId,
  ) as any[];

  await board.save();
  return board;
};

// delete co-manager
export const removeCoManager = async (
  boardId: string,
  targetUserId: string,
  userId: string,
) => {
  const board = await Board.findById(boardId);
  if (!board) throw new Error('Board not found');

  if (board.ownerId.toString() !== userId) {
    throw new Error('Forbidden: Only owner can remove co-managers');
  }

  //Xóa khỏi coManagerIds
  board.coManagerIds = board.coManagerIds.filter(
    (id) => id.toString() !== targetUserId,
  ) as any[];

  //Đưa trở lại memberIds
  const targetObjectId = new Types.ObjectId(targetUserId);
  if (!board.memberIds.includes(targetObjectId)) {
    board.memberIds.push(targetObjectId);
  }

  await board.save();
  return board;
};

export const getBoardsWithPagination = async (
  userId: string,
  page: number,
  limit: number,
  search: string,
  sort: string,
) => {
  const skip = (page - 1) * limit;

  const query: any = {
    $or: [{ ownerId: userId }, { coManagerIds: userId }, { memberIds: userId }],
  };

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const sortOption = sort === 'asc' ? { createdAt: 1 } : { createdAt: -1 };

  const [boards, totalBoards] = await Promise.all([
    Board.find(query)
      .sort(sortOption as any)
      .skip(skip)
      .limit(limit)
      .populate('ownerId', 'fullName avatar email')
      .exec(),
    Board.countDocuments(query).exec(),
  ]);

  return {
    boards,
    meta: {
      totalBoards,
      totalPages: Math.ceil(totalBoards / limit),
      currentPage: page,
      limit,
    },
  };
};
