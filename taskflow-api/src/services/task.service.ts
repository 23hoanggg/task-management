import { ITask, Task } from '../models/task.model';
import { List } from '../models/list.model';
import * as boardService from './board.service';
import * as notificationService from './notification.service';
import { io } from '../server';

const emitTasksUpdate = (boardId: string) => {
  io.to(boardId).emit('tasks:updated');
  console.log(
    `Socket event 'tasks:updated' đã được phát tới phòng: ${boardId}`,
  );
};

// create task
export const createTask = async (
  taskData: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: Date;
  },
  boardId: string,
  listId: string,
  userId: string,
) => {
  const parentList = await List.findById(listId);
  if (!parentList) {
    throw new Error('List not found');
  }

  await boardService.getBoardById(boardId, userId);

  const lastTask = await Task.findOne({ listId }).sort({ order: 'desc' });
  const newOrder = lastTask ? lastTask.order + 1 : 1;

  const newTask = await Task.create({
    ...taskData,
    boardId,
    listId,
    creatorId: userId,
    order: newOrder,
    assigneeIds: [],
  });

  emitTasksUpdate(boardId);

  return newTask;
};

// lay task cua board theo id board
export const getTasksByBoardId = async (boardId: string, userId: string) => {
  await boardService.getBoardById(boardId, userId);
  const tasks = await Task.find({ boardId })
    .populate('assigneeIds', 'fullName email')
    .sort({ listId: 1, order: 1 });
  return tasks;
};

// lay task cua list theo id list
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

  const board = await boardService.getBoardById(
    task.boardId.toString(),
    userId,
  );
  const role = boardService.getUserRoleInBoard(board!, userId);

  // check role user: member chi duoc edit task do minh tao ra
  if (role === 'member' && task.creatorId.toString() !== userId) {
    throw new Error('Forbidden: Members can only edit their own tasks');
  }

  // Trigger notification nếu có người mới được gán
  if (updateData.assigneeIds) {
    const currentAssigneeIds = task.assigneeIds.map((id) => id.toString());
    const newAssigneeIds = (updateData.assigneeIds as any[]).map((id) =>
      id.toString(),
    );
    const newlyAdded = newAssigneeIds.filter(
      (id) => !currentAssigneeIds.includes(id),
    );

    newlyAdded.forEach((assigneeId) => {
      notificationService.createNotification({
        userId: assigneeId,
        title: 'Task Assigned',
        content: `Bạn được gán vào thẻ: ${task.title}`,
        targetUrl: `/boards/${task.boardId}/tasks/${task._id}`,
        type: 'task_assigned',
      });
    });
  }

  Object.assign(task, updateData);
  await task.save();

  emitTasksUpdate(task.boardId.toString());

  return task;
};

// delete task
export const deleteTask = async (taskId: string, userId: string) => {
  const task = await getTaskById(taskId, userId);

  const board = await boardService.getBoardById(
    task.boardId.toString(),
    userId,
  );
  const role = boardService.getUserRoleInBoard(board!, userId);

  // check role member
  if (role === 'member' && task.creatorId.toString() !== userId) {
    throw new Error('Forbidden: Members can only delete their own tasks');
  }

  await Task.findByIdAndDelete(taskId);
  emitTasksUpdate(task.boardId.toString());
};

// reorder task
export const reorderTasks = async (
  tasksToUpdate: { _id: string; order: number; listId: string }[],
  userId: string,
) => {
  if (!tasksToUpdate || tasksToUpdate.length === 0) return;

  const firstTask = await Task.findById(tasksToUpdate[0]!._id);
  if (!firstTask) throw new Error('Task not found');

  const boardId = firstTask.boardId.toString();
  const board = await boardService.getBoardById(boardId, userId);
  const role = boardService.getUserRoleInBoard(board!, userId);

  // check member tao task và member duoc gan vao task
  if (role === 'member') {
    const taskIds = tasksToUpdate.map((t) => t._id);
    const tasks = await Task.find({ _id: { $in: taskIds } });

    const allAllowed = tasks.every((t) => {
      const isCreator = t.creatorId.toString() === userId;
      const isAssignee = t.assigneeIds.some(
        (assigneeId) => assigneeId.toString() === userId,
      );

      return isCreator || isAssignee;
    });

    if (!allAllowed) {
      throw new Error(
        'Forbidden: Members can only reorder tasks they created or are assigned to',
      );
    }
  }

  const bulkOps = tasksToUpdate.map((task) => ({
    updateOne: {
      filter: { _id: task._id },
      update: { $set: { order: task.order, listId: task.listId } },
    },
  }));

  await Task.bulkWrite(bulkOps);
  emitTasksUpdate(boardId);
};
