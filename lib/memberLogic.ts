import { addEventLog } from "./gameLogic";
import type { GameState } from "./types";

export function updateMemberName(state: GameState, memberId: string, name: string): GameState {
  const member = state.members.find((candidate) => candidate.id === memberId);
  if (!member) return state;

  const members = state.members.map((candidate) =>
    candidate.id === memberId
      ? { ...candidate, name: name.trim(), updatedAt: new Date().toISOString() }
      : candidate,
  );

  return addEventLog({ ...state, members }, `${member.name}の名前を${name.trim()}に変更しました。`, "system");
}

export function deleteMember(state: GameState, memberId: string): GameState {
  const member = state.members.find((candidate) => candidate.id === memberId);
  if (!member) return state;

  const members = state.members.filter((candidate) => candidate.id !== memberId);
  const teams = state.teams.map((team) => ({
    ...team,
    memberIds: team.memberIds.filter((id) => id !== memberId),
    updatedAt: new Date().toISOString(),
  }));
  const items = state.items.map((item) =>
    item.ownerMemberId === memberId
      ? {
          ...item,
          ownerType: "none" as const,
          ownerMemberId: undefined,
          status: "available" as const,
          updatedAt: new Date().toISOString(),
        }
      : item,
  );
  const notifications = state.notifications.map((notification) => ({
    ...notification,
    readByMemberIds: notification.readByMemberIds.filter((id) => id !== memberId),
  }));

  return addEventLog({ ...state, members, teams, items, notifications }, `${member.name}を削除しました。`, "system");
}
