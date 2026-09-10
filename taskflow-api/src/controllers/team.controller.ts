import { Request, Response, NextFunction } from 'express';
import * as teamService from '../services/team.service';

export const createTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { boardId, name } = req.body;
    const requesterId = req.user!.userId;

    if (!boardId || !name) {
      return res.status(400).json({ message: 'boardId and name are required' });
    }

    const team = await teamService.createTeam(boardId, name, requesterId);
    res.status(201).json({ message: 'Tạo nhóm thành công', data: team });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Forbidden'))
        return res.status(403).json({ message: error.message });
      if (error.message === 'Board not found')
        return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

export const getTeamsByBoard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { boardId } = req.params;

    if (!boardId) {
      return res.status(400).json({ message: 'boardId is required' });
    }

    const teams = await teamService.getTeamsByBoard(boardId);
    res.status(200).json({ data: teams });
  } catch (error) {
    next(error);
  }
};

export const updateTeamMembers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { teamId } = req.params;
    const { targetUserId, action } = req.body;
    const requesterId = req.user!.userId;

    if (!teamId || !targetUserId || !action) {
      return res
        .status(400)
        .json({ message: 'teamId, targetUserId and action are required' });
    }

    const updatedTeam = await teamService.updateTeamMembers(
      teamId,
      targetUserId,
      action,
      requesterId,
    );

    res.status(200).json({
      message: 'Cập nhật thành viên nhóm thành công',
      data: updatedTeam,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Forbidden'))
        return res.status(403).json({ message: error.message });
      if (error.message === 'Team not found')
        return res.status(404).json({ message: error.message });
      if (error.message === 'Invalid action')
        return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { teamId } = req.params;
    const requesterId = req.user!.userId;

    if (!teamId) {
      return res.status(400).json({ message: 'teamId is required' });
    }

    await teamService.deleteTeam(teamId, requesterId);
    res.status(200).json({ message: 'Xóa nhóm thành công' });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Forbidden'))
        return res.status(403).json({ message: error.message });
      if (error.message === 'Team not found')
        return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};
