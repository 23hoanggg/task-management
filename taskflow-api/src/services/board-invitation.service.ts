import { BoardInvitation } from '../models/board-invitation.model';
import { User } from '../models/user.model';
import { Board } from '../models/board.model';
import * as boardService from './board.service';
import * as notificationService from './notification.service';

// invite user vao Board qua email
export const inviteUserByEmail = async (
  boardId: string,
  inviteeEmail: string,
  senderId: string,
) => {
  const board = await boardService.getBoardById(boardId, senderId);
  const role = boardService.getUserRoleInBoard(board!, senderId);

  // check role co kha nang them moi user
  if (role === 'member') {
    throw new Error('Forbidden: Members cannot invite users');
  }

  const invitee = await User.findOne({ email: inviteeEmail });
  if (!invitee) {
    throw new Error('User with this email is not registered in the system');
  }

  // check user exis trong board tu truoc
  if (board!.memberIds.includes(invitee._id as any)) {
    throw new Error('User is already in the board');
  }

  const invitation = await BoardInvitation.create({
    boardId,
    senderId,
    inviteeId: invitee._id,
    type: 'invite',
    status: 'pending',
  });

  // Gắn thông báo chuông cho người được mời
  await notificationService.createNotification({
    userId: String(invitee._id),
    title: 'Lời mời tham gia bảng',
    content: `Bạn được mời tham gia bảng ${board!.name}`,
    targetUrl: `/invitations/${invitation._id}`,
    type: 'board_invite',
  });

  return invitation;
};

// User accept invite
export const acceptInvitation = async (
  invitationId: string,
  userId: string,
) => {
  const invitation = await BoardInvitation.findById(invitationId);
  // check trang thai loi moi
  if (!invitation || invitation.status !== 'pending')
    throw new Error('Invalid invitation');

  // check user co phai nguoi duoc moi khong
  if (invitation.inviteeId.toString() !== userId) throw new Error('Forbidden');

  invitation.status = 'accepted';
  await invitation.save();

  const board = await Board.findById(invitation.boardId);
  if (!board) throw new Error('Board no longer exists');

  // them user vao Board
  board.memberIds.push(invitation.inviteeId);
  await board.save();

  return invitation;
};
