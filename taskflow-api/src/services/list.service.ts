import { List } from '../models/list.model';
import * as boardService from './board.service';
import { Types } from 'mongoose';

// create list
export const createList = async (
  listData: { name: string; description?: string; dueDate?: Date },
  boardId: string,
  userId: string,
) => {
  // check board ton tai va role user
  const board = await boardService.getBoardById(boardId, userId);
  if (!board) {
    throw new Error('Board not found or user does not have access');
  }

  const role = boardService.getUserRoleInBoard(board, userId);
  if (role === 'member') {
    throw new Error('Forbidden: Members cannot create lists');
  }

  const lastList = await List.findOne({ boardId }).sort({ order: 'desc' });
  const newOrder = lastList ? lastList.order + 1 : 1;

  const newList = await List.create({
    ...listData,
    boardId: boardId,
    order: newOrder,
  });

  return newList;
};

// lay list cua board theo id board
export const getListByBoardId = async (boardId: string, userId: string) => {
  await boardService.getBoardById(boardId, userId);

  // data tra ve bao gom list + so luong thanh vien active trong list do
  const lists = await List.aggregate([
    { $match: { boardId: new Types.ObjectId(boardId) } }, // loc list theo boardId
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: 'listId',
        as: 'tasks',
      },
    },
    {
      $addFields: {
        allAssignees: {
          $reduce: {
            input: '$tasks.assigneeIds',
            initialValue: [],
            in: { $setUnion: ['$$value', '$$this'] },
          },
        },
      },
    },
    {
      $addFields: {
        totalActiveMembers: { $size: '$allAssignees' },
      },
    },
    { $sort: { order: 1 } }, // sap xep theo order tang dan
    { $project: { tasks: 0, allAssignees: 0 } },
  ]);

  return lists;
};

// update list
export const updateList = async (
  listId: string,
  userId: string,
  updateData: {
    name?: string;
    order?: number;
    description?: string;
    dueDate?: Date;
  },
) => {
  // check list
  const list = await List.findById(listId);
  if (!list) {
    throw new Error('List not found');
  }

  // check role user
  const board = await boardService.getBoardById(
    list.boardId.toString(),
    userId,
  );
  const role = boardService.getUserRoleInBoard(board!, userId);
  if (role === 'member')
    throw new Error('Forbidden: Members cannot update lists');

  Object.assign(list, updateData);
  await list.save();
  return list;
};

export const deleteList = async (listId: string, userId: string) => {
  const list = await List.findById(listId);
  if (!list) {
    throw new Error('List not found');
  }

  const board = await boardService.getBoardById(
    list.boardId.toString(),
    userId,
  );
  const role = boardService.getUserRoleInBoard(board!, userId);
  if (role === 'member')
    throw new Error('Forbidden: Members cannot delete lists');

  await List.findByIdAndDelete(listId);
};

// reorder list
export const reorderLists = async (
  listsToUpdate: { _id: string; order: number }[],
  userId: string,
) => {
  if (!listsToUpdate || listsToUpdate.length === 0) {
    return;
  }

  const firstList = await List.findById(listsToUpdate[0]!._id);
  if (!firstList) {
    throw new Error('List not found');
  }
  const board = await boardService.getBoardById(
    firstList.boardId.toString(),
    userId,
  );

  const role = boardService.getUserRoleInBoard(board!, userId);
  if (role === 'member')
    throw new Error('Forbidden: Members cannot reorder lists');

  const bulkOps = listsToUpdate.map((list) => ({
    updateOne: {
      filter: { _id: list._id },
      update: { $set: { order: list.order } },
    },
  }));

  await List.bulkWrite(bulkOps);
};
