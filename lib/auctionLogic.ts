import { chargeTeamMembersEvenly } from "./coinLogic";
import { addEventLog, addNotification } from "./gameLogic";
import type { GameState } from "./types";

export function placeAuctionBid(
  state: GameState,
  auctionItemId: string,
  teamId: string,
  bidPrice: number,
): GameState {
  const auctionItem = state.auctionItems.find((candidate) => candidate.id === auctionItemId);
  const team = state.teams.find((candidate) => candidate.id === teamId);
  if (!auctionItem || !team || auctionItem.status !== "open" || bidPrice <= auctionItem.currentPrice) {
    return state;
  }

  const auctionItems = state.auctionItems.map((candidate) =>
    candidate.id === auctionItemId
      ? {
          ...candidate,
          currentPrice: bidPrice,
          winnerTeamId: teamId,
          updatedAt: new Date().toISOString(),
        }
      : candidate,
  );

  const message = `${team.name}が「${auctionItem.name}」に${bidPrice}沖コインで入札しました。`;
  return addNotification(addEventLog({ ...state, auctionItems }, message, "auction"), "入札更新", message, "auction");
}

export function settleAuctionItem(
  state: GameState,
  auctionItemId: string,
  winnerTeamId: string,
  price: number,
): GameState {
  const auctionItem = state.auctionItems.find((candidate) => candidate.id === auctionItemId);
  const team = state.teams.find((candidate) => candidate.id === winnerTeamId);
  if (!auctionItem || !team) return state;

  const auctionItems = state.auctionItems.map((candidate) =>
    candidate.id === auctionItemId
      ? {
          ...candidate,
          currentPrice: price,
          winnerTeamId,
          status: "closed" as const,
          updatedAt: new Date().toISOString(),
        }
      : candidate,
  );

  let next = chargeTeamMembersEvenly({ ...state, auctionItems }, winnerTeamId, price);
  next = addEventLog(next, `${team.name}が「${auctionItem.name}」を${price}沖コインで落札しました。`, "auction");
  next = addNotification(next, "オークション落札", `${team.name}が「${auctionItem.name}」を落札！`, "auction");
  return next;
}
