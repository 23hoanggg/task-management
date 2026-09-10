// Thêm vào file src/controllers/user.controller.ts (hoặc board.controller.ts)
import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';

export const searchUsersToInvite = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { boardId } = req.params;
    const { q } = req.query;

    // case nếu q không tồn tại hoặc là chuỗi rỗng, trả về mảng rỗng
    if (!q || typeof q !== 'string' || q.trim() === '') {
      return res.status(200).json({ data: [] });
    }

    const users = await userService.searchUsersForInvitation(
      boardId as string,
      q.trim(),
    );

    res.status(200).json({ data: users });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Board not found')
        return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};
