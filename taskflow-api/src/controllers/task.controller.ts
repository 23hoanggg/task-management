import { NextFunction, Request, Response } from 'express';
import { Task } from '../models/task.model';
import * as taskService from '../services/task.service';

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { listId } = req.params;
    const userId = req.user?.userId;

    const newTask = await taskService.createTask(
      req.body,
      listId as string,
      userId as string,
    );
    res.status(201).json({ data: newTask });
  } catch (error) {
    next(error);
  }
};

export const getTasksByBoard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.userId;

    const tasks = await taskService.getTasksByBoardId(
      boardId as string,
      userId,
    );
    res.status(200).json({ data: tasks });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { taskId } = req.params;
    const userId = req.user!.userId;
    const task = await taskService.getTaskById(taskId as string, userId);
    res.status(200).json({ data: task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { taskId } = req.params;
    const userId = req.user!.userId;
    const updatedTask = await taskService.updateTask(
      taskId as string,
      userId,
      req.body,
    );
    res.status(200).json({ data: updatedTask });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { taskId } = req.params;
    const userId = req.user!.userId;
    await taskService.deleteTask(taskId as string, userId);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export const reorderTasks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // req.body sẽ có dạng { tasks: [{ _id, order, listId }, ...] }
    const { tasks } = req.body;
    const userId = req.user!.userId;

    await taskService.reorderTasks(tasks, userId);
    res.status(200).json({ message: 'Task order updated successfully' });
  } catch (error) {
    next(error);
  }
};
