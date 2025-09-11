import { Request, Response, NextFunction } from 'express';
import * as listService from '../services/list.service';

export const createList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.userId;

    const newList = await listService.createList(
      req.body,
      boardId as string,
      userId,
    );
    res.status(201).json({ data: newList });
  } catch (error) {
    next(error);
  }
};

export const getLists = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { boardId } = req.params;
    const userId = req.user?.userId;

    const lists = await listService.getListByBoardId(
      boardId as string,
      userId as string,
    );

    res.status(200).json({ data: lists });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Board not found')) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const updateList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { listId } = req.params;
    const userId = req.user!.userId;
    const updatedList = await listService.updateList(
      listId as string,
      userId,
      req.body,
    );
    res.status(200).json({ data: updatedList });
  } catch (error) {
    next(error);
  }
};

export const deleteList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { listId } = req.params;
    const userId = req.user?.userId;

    await listService.deleteList(listId as string, userId as string);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
