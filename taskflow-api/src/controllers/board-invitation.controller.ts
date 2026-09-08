import { Request, Response, NextFunction } from 'express';
import * as invitationService from '../services/board-invitation.service';

export const inviteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { boardId } = req.params;
    const { email } = req.body;
    const senderId = req.user!.userId;

    if (!boardId) {
      return res.status(400).json({ message: 'Board ID is required' });
    }

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const invitation = await invitationService.inviteUserByEmail(boardId, email, senderId);
    res.status(201).json({ message: 'Invitation sent successfully', data: invitation });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Forbidden')) return res.status(403).json({ message: error.message });
      if (error.message.includes('User with this email is not registered')) return res.status(404).json({ message: error.message });
      if (error.message.includes('User is already in the board')) return res.status(409).json({ message: error.message });
    }
    next(error);
  }
};

export const acceptInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user!.userId;

    if(!invitationId) {
      return res.status(400).json({ message: 'Invitation ID is required' });
    }

    const acceptedInvite = await invitationService.acceptInvitation(invitationId, userId);
    res.status(200).json({ message: 'Joined board successfully', data: acceptedInvite });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Forbidden')) return res.status(403).json({ message: error.message });
      if (error.message.includes('Invalid invitation')) return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};