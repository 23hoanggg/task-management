import { Request, Response, NextFunction } from 'express';
import * as boardService from '../services/board.service';
import { Board } from '../models/board.model';

export const createBoard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ownerId = req.user!.userId;
    const newBoard = await boardService.createBoard(req.body, ownerId);
    res.status(201).json({ data: newBoard });
  } catch (error) {
    next(error);
  }
};

export const getBoards = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const boards = await boardService.getBoardByUserId(userId);
    res.status(200).json({ data: boards });
  } catch (error) {
    next(error);
  }
};

export const getBoardById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.userId;

    const board = await boardService.getBoardById(boardId as string, userId);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    res.status(200).json({ data: board });
  } catch (error) {
    if (error instanceof Error && error.message === 'Forbidden') {
      return res
        .status(403)
        .json({ message: 'You do not have permission to view this board' });
    }
    next(error);
  }
};

export const updateBoard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { boardId } = req.params;
    const userId = req.user?.userId;

    const updateBoard = await boardService.updateBoard(
      boardId as string,
      userId as string,
      req.body,
    );

    res.status(200).json({ data: updateBoard });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Not Found')
        return res.status(404).json({ message: 'Board not found' });
      if (error.message === 'Forbidden')
        return res
          .status(403)
          .json({ message: 'You are not the owner of this board' });
    }
    next(error);
  }
};

export const deleteBoard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { boardId } = req.params;
    const userId = req.user?.userId;

    await boardService.deleteBoard(boardId as string, userId as string);

    res.sendStatus(204);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Not Found')
        return res.status(404).json({ message: 'Board not found' });
      if (error.message === 'Forbidden')
        return res
          .status(403)
          .json({ message: 'You are not the owner of this board' });
    }
    next(error);
  }
};
