import { addEventLog } from "./gameLogic";
import type { GameState } from "./types";

export function addCoinToMember(state: GameState, memberId: string, amount: number): GameState {
  const members = state.members.map((member) =>
    member.id === memberId
      ? {
          ...member,
          coin: member.coin + amount,
          totalEarnedCoin: member.totalEarnedCoin + Math.max(amount, 0),
          updatedAt: new Date().toISOString(),
        }
      : member,
  );
  const member = state.members.find((candidate) => candidate.id === memberId);
  return addEventLog({ ...state, members }, `${member?.name ?? "メンバー"}に${amount}沖コインを付与しました。`, "coin");
}

export function subtractCoinFromMember(state: GameState, memberId: string, amount: number): GameState {
  const members = state.members.map((member) =>
    member.id === memberId
      ? {
          ...member,
          coin: Math.max(0, member.coin - amount),
          totalSpentCoin: member.totalSpentCoin + Math.max(amount, 0),
          updatedAt: new Date().toISOString(),
        }
      : member,
  );
  const member = state.members.find((candidate) => candidate.id === memberId);
  return addEventLog({ ...state, members }, `${member?.name ?? "メンバー"}から${amount}沖コインを減算しました。`, "coin");
}

export function distributeRewardToTeam(state: GameState, teamId: string, rewardCoin: number): GameState {
  const team = state.teams.find((candidate) => candidate.id === teamId);
  if (!team || team.memberIds.length === 0) return state;

  const perMember = Math.floor(rewardCoin / team.memberIds.length);
  const members = state.members.map((member) =>
    team.memberIds.includes(member.id)
      ? {
          ...member,
          coin: member.coin + perMember,
          totalEarnedCoin: member.totalEarnedCoin + perMember,
          updatedAt: new Date().toISOString(),
        }
      : member,
  );

  return addEventLog(
    { ...state, members },
    `${team.name}の各メンバーに${perMember}沖コインを配布しました。`,
    "coin",
  );
}

export function chargeTeamMembersEvenly(state: GameState, teamId: string, amount: number): GameState {
  const team = state.teams.find((candidate) => candidate.id === teamId);
  if (!team || team.memberIds.length === 0) return state;

  const perMember = Math.ceil(amount / team.memberIds.length);
  const members = state.members.map((member) =>
    team.memberIds.includes(member.id)
      ? {
          ...member,
          coin: Math.max(0, member.coin - perMember),
          totalSpentCoin: member.totalSpentCoin + perMember,
          updatedAt: new Date().toISOString(),
        }
      : member,
  );

  return addEventLog(
    { ...state, members },
    `${team.name}の各メンバーから${perMember}沖コインを徴収しました。`,
    "coin",
  );
}
