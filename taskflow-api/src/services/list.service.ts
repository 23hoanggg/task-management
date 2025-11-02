import { List } from '../models/list.model';
import * as boardService from './board.service';

export const createList = async (
  listData: { name: string },
  boardId: string,
  userId: string,
) => {
  const board = await boardService.getBoardById(boardId, userId);
  if (!board) {
    throw new Error('Board not found or user does not have access');
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

export const getListByBoardId = async (boardId: string, userId: string) => {
  const board = await boardService.getBoardById(boardId, userId);

  if (!board) {
    throw new Error('Board not found or user does not have access');
  }

  const lists = await List.find({ boardId }).sort({ order: 'asc' });

  return lists;
};

export const updateList = async (
  listId: string,
  userId: string,
  updateData: { name?: string; order?: number },
) => {
  const list = await List.findById(listId);
  if (!list) {
    throw new Error('List not found');
  }

  await boardService.getBoardById(list.boardId.toString(), userId);

  Object.assign(list, updateData);
  await list.save();
  return list;
};

export const deleteList = async (listId: string, userId: string) => {
  const list = await List.findById(listId);
  if (!list) {
    throw new Error('List not found');
  }

  await boardService.getBoardById(list.boardId.toString(), userId);

  await List.findByIdAndDelete(listId);
};

export const reorderLists = async (
  listsToUpdate: { _id: string; order: number }[],
  userId: string,
) => {
  if (!listsToUpdate || listsToUpdate.length === 0) {
    return;
  }

  // Phân quyền: Kiểm tra user có quyền với board chứa các list này không
  const firstList = await List.findById(listsToUpdate[0]!._id);
  if (!firstList) {
    throw new Error('List not found');
  }
  await boardService.getBoardById(firstList.boardId.toString(), userId);

  // Tạo các lệnh cập nhật cho bulkWrite
  const bulkOps = listsToUpdate.map((list) => ({
    updateOne: {
      filter: { _id: list._id },
      update: { $set: { order: list.order } },
    },
  }));

  await List.bulkWrite(bulkOps);
};
