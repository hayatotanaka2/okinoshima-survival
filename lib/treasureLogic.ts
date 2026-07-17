import { addCoinToMember } from "./coinLogic";
import { addEventLog, addNotification } from "./gameLogic";
import { assignItemToMember } from "./itemLogic";
import type { GameState } from "./types";

export function claimTreasureByCode(state: GameState, code: string, memberId: string): GameState {
  const normalized = code.trim().toUpperCase();
  const treasure = state.treasures.find((candidate) => candidate.code.toUpperCase() === normalized);
  const member = state.members.find((candidate) => candidate.id === memberId);
  if (!treasure || !member || treasure.status === "claimed") return state;

  const treasures = state.treasures.map((candidate) =>
    candidate.id === treasure.id
      ? {
          ...candidate,
          status: "claimed" as const,
          claimedByMemberId: memberId,
          claimedByTeamId: member.currentTeamId,
          claimedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      : candidate,
  );

  let next: GameState = { ...state, treasures };
  if (treasure.rewardType === "coin" && treasure.rewardCoin) {
    next = addCoinToMember(next, memberId, treasure.rewardCoin);
  }
  if (treasure.rewardType === "item" && treasure.rewardItemId) {
    next = assignItemToMember(next, treasure.rewardItemId, memberId);
  }

  next = addEventLog(next, `${member.name}が宝箱「${treasure.title}」を発見しました。`, "treasure");
  next = addNotification(next, "宝箱発見", `${member.name}が「${treasure.title}」を発見！`, "treasure");
  return next;
}
