import { ITask, Task } from '../models/task.model';
import { List } from '../models/list.model';
import * as boardService from './board.service';
import { io } from '../server';

const emitTasksUpdate = (boardId: string) => {
  io.to(boardId).emit('tasks:updated');
  console.log(
    `Socket event 'tasks:updated' đã được phát tới phòng: ${boardId}`,
  );
};

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
    boardId: boardId,
    listId,
    ownerId: userId,
    order: newOrder,
  });

  emitTasksUpdate(boardId);

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

  emitTasksUpdate(task.boardId.toString());

  return task;
};

export const deleteTask = async (taskId: string, userId: string) => {
  const task = await getTaskById(taskId, userId);

  await Task.findByIdAndDelete(taskId);

  emitTasksUpdate(task.boardId.toString());
};

export const reorderTasks = async (
  tasksToUpdate: { _id: string; order: number; listId: string }[],
  userId: string,
) => {
  if (!tasksToUpdate || tasksToUpdate.length === 0) return;

  const firstTask = await Task.findById(tasksToUpdate[0]!._id);
  if (!firstTask) throw new Error('Task not found');

  const boardId = firstTask.boardId.toString();
  await boardService.getBoardById(boardId, userId);

  // Tạo các lệnh cập nhật cho bulkWrite
  const bulkOps = tasksToUpdate.map((task) => ({
    updateOne: {
      filter: { _id: task._id },
      update: { $set: { order: task.order, listId: task.listId } },
    },
  }));

  await Task.bulkWrite(bulkOps);
  emitTasksUpdate(boardId);
};
