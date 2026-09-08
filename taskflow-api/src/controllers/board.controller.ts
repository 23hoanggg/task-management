import { Request, Response, NextFunction } from 'express';
import * as boardService from '../services/board.service';

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
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return res.status(403).json({ message: error.message });
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

    const updatedBoard = await boardService.updateBoard(
      boardId as string,
      userId as string,
      req.body,
    );

    res.status(200).json({ data: updatedBoard });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Not Found')
        return res.status(404).json({ message: 'Board not found' });
      if (error.message.includes('Forbidden'))
        return res.status(403).json({ message: error.message });
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
      if (error.message.includes('Forbidden'))
        return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

export const getMembers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { boardId } = req.params;
    const userId = req.user!.userId;

    if (!boardId)
      return res.status(400).json({ message: 'Board ID is required' });

    const membersInfo = await boardService.getBoardMembers(boardId, userId);
    res.status(200).json({ data: membersInfo });
  } catch (error) {
    next(error);
  }
};

export const addCoManager = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { boardId } = req.params;
    const { targetUserId } = req.body;
    const userId = req.user!.userId;

    if (!boardId || !targetUserId) {
      return res
        .status(400)
        .json({ message: 'Board ID and target user ID are required' });
    }

    const board = await boardService.addCoManager(
      boardId,
      targetUserId,
      userId,
    );
    res
      .status(200)
      .json({ message: 'Co-manager added successfully', data: board });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};

export const removeCoManager = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { boardId, targetUserId } = req.params;
    const userId = req.user!.userId;

    const board = await boardService.removeCoManager(
      boardId as string,
      targetUserId as string,
      userId,
    );
    res
      .status(200)
      .json({ message: 'Co-manager removed successfully', data: board });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return res.status(403).json({ message: error.message });
    }
    next(error);
  }
};
