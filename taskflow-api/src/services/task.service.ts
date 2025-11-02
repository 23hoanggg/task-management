import { ITask, Task } from '../models/task.model';
import { List } from '../models/list.model';
import * as boardService from './board.service';

export const createTask = async (
  taskData: { title: string; description?: string },
  listId: string,
  userId: string,
) => {
  const parentList = await List.findById(listId);
  if (!parentList) {
    throw new Error('List not found');
  }
  const boardId = parentList.boardId.toString();

  await boardService.getBoardById(boardId, userId);

  const lastTask = await Task.findOne({ listId }).sort({ order: 'desc' });
  const newOrder = lastTask ? lastTask.order + 1 : 1;

  const newTask = await Task.create({
    ...taskData,
    boardId,
    listId,
    ownerId: userId,
    order: newOrder,
  });

  return newTask;
};

export const getTasksByBoardId = async (boardId: string, userId: string) => {
  await boardService.getBoardById(boardId, userId);

  const tasks = await Task.find({ boardId }).sort({ listId: 1, order: 1 });

  return tasks;
};

export const getTaskById = async (taskId: string, userId: string) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new Error('Task not found');
  }
  await boardService.getBoardById(task.boardId.toString(), userId);
  return task;
};

export const updateTask = async (
  taskId: string,
  userId: string,
  updateData: Partial<ITask>,
) => {
  const task = await getTaskById(taskId, userId);

  Object.assign(task, updateData);
  await task.save();
  return task;
};

export const deleteTask = async (taskId: string, userId: string) => {
  await getTaskById(taskId, userId);
  await Task.findByIdAndDelete(taskId);
};

export const reorderTasks = async (
  tasksToUpdate: { _id: string; order: number; listId: string }[],
  userId: string,
) => {
  if (!tasksToUpdate || tasksToUpdate.length === 0) {
    return;
  }

  // Phân quyền: Kiểm tra xem user có quyền truy cập vào board chứa các task này không.
  // Ta chỉ cần kiểm tra task đầu tiên là đủ, vì tất cả task được di chuyển đều phải thuộc cùng 1 board.
  const firstTask = await Task.findById(tasksToUpdate[0]!._id); // <-- THÊM DẤU `!` VÀO ĐÂY

  if (!firstTask) {
    throw new Error('Task not found');
  }
  await boardService.getBoardById(firstTask.boardId.toString(), userId);

  // Tạo các lệnh cập nhật cho bulkWrite
  const bulkOps = tasksToUpdate.map((task) => ({
    updateOne: {
      filter: { _id: task._id },
      update: { $set: { order: task.order, listId: task.listId } },
    },
  }));

  // Thực hiện cập nhật hàng loạt
  await Task.bulkWrite(bulkOps);
};
