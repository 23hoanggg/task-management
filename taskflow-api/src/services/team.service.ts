import { Team } from '../models/team.model';
import { Board } from '../models/board.model';
import * as boardService from './board.service';

// check quyen
const checkManagePermission = (board: any, userId: string) => {
  const role = boardService.getUserRoleInBoard(board, userId);
  if (role === 'member') {
    throw new Error('Forbidden: Only Owner or Co-manager can manage teams');
  }
};

export const createTeam = async (
  boardId: string,
  name: string,
  requesterId: string,
) => {
  const board = await Board.findById(boardId);
  if (!board) throw new Error('Board not found');

  checkManagePermission(board, requesterId);

  const team = await Team.create({ boardId, name, memberIds: [] });
  return team;
};

export const updateTeamMembers = async (
  teamId: string,
  targetUserId: string,
  action: 'add' | 'remove',
  requesterId: string,
) => {
  const team = await Team.findById(teamId);
  if (!team) throw new Error('Team not found');

  const board = await Board.findById(team.boardId);
  checkManagePermission(board, requesterId);

  if (action === 'add') {
    if (!team.memberIds.includes(targetUserId as any)) {
      team.memberIds.push(targetUserId as any);
    }
  } else if (action === 'remove') {
    team.memberIds = team.memberIds.filter(
      (id) => id.toString() !== targetUserId,
    );
  } else {
    throw new Error('Invalid action');
  }

  await team.save();
  return await team.populate('memberIds', '_id fullName email avatar');
};

export const deleteTeam = async (teamId: string, requesterId: string) => {
  const team = await Team.findById(teamId);
  if (!team) throw new Error('Team not found');

  const board = await Board.findById(team.boardId);
  checkManagePermission(board, requesterId);

  await Team.findByIdAndDelete(teamId);
  return team;
};

export const getTeamsByBoard = async (boardId: string) => {
  return await Team.find({ boardId })
    .populate('memberIds', '_id fullName email avatar')
    .sort({ createdAt: 1 });
};
