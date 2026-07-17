import { addEventLog, addNotification } from "./gameLogic";
import type { GameState } from "./types";

export function assignItemToMember(state: GameState, itemId: string, memberId: string): GameState {
  const item = state.items.find((candidate) => candidate.id === itemId);
  const member = state.members.find((candidate) => candidate.id === memberId);
  if (!item || !member) return state;

  const items = state.items.map((candidate) =>
    candidate.id === itemId
      ? {
          ...candidate,
          ownerType: "member" as const,
          ownerMemberId: memberId,
          ownerTeamId: undefined,
          status: "owned" as const,
          updatedAt: new Date().toISOString(),
        }
      : candidate,
  );
  const members = state.members.map((candidate) =>
    candidate.id === memberId
      ? { ...candidate, itemIds: Array.from(new Set([...candidate.itemIds, itemId])) }
      : candidate,
  );

  return addEventLog({ ...state, items, members }, `${member.name}が「${item.name}」を獲得しました。`, "item");
}

export function assignItemToTeam(state: GameState, itemId: string, teamId: string): GameState {
  const item = state.items.find((candidate) => candidate.id === itemId);
  const team = state.teams.find((candidate) => candidate.id === teamId);
  if (!item || !team) return state;

  const items = state.items.map((candidate) =>
    candidate.id === itemId
      ? {
          ...candidate,
          ownerType: "team" as const,
          ownerTeamId: teamId,
          ownerMemberId: undefined,
          status: "owned" as const,
          updatedAt: new Date().toISOString(),
        }
      : candidate,
  );

  return addEventLog({ ...state, items }, `${team.name}が「${item.name}」を獲得しました。`, "item");
}

export function useItem(state: GameState, itemId: string, actorName: string): GameState {
  const item = state.items.find((candidate) => candidate.id === itemId);
  if (!item || item.status !== "owned") return state;

  const items = state.items.map((candidate) =>
    candidate.id === itemId
      ? {
          ...candidate,
          status: "used" as const,
          updatedAt: new Date().toISOString(),
        }
      : candidate,
  );

  const message = `${actorName}が「${item.name}」を使用しました。`;
  return addNotification(addEventLog({ ...state, items }, message, "item"), "アイテム使用", message, "item");
}
