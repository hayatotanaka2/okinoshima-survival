import { chargeTeamMembersEvenly } from "./coinLogic";
import { addEventLog, addNotification } from "./gameLogic";
import type { GameState, Item } from "./types";

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
  winnerMemberId?: string,
): GameState {
  const auctionItem = state.auctionItems.find((candidate) => candidate.id === auctionItemId);
  const team = state.teams.find((candidate) => candidate.id === winnerTeamId);
  const winnerMember = state.members.find((candidate) => candidate.id === winnerMemberId);
  if (!auctionItem || !team) return state;

  const auctionItems = state.auctionItems.map((candidate) =>
    candidate.id === auctionItemId
      ? {
          ...candidate,
          currentPrice: price,
          winnerTeamId,
          winnerMemberId,
          status: "closed" as const,
          updatedAt: new Date().toISOString(),
        }
      : candidate,
  );

  let next = chargeTeamMembersEvenly({ ...state, auctionItems }, winnerTeamId, price);
  if (winnerMember) {
    const itemId = `item-from-${auctionItem.id}`;
    const exists = next.items.some((item) => item.id === itemId);
    const item: Item = {
      id: itemId,
      name: auctionItem.name,
      description: auctionItem.description,
      type: "privilege",
      value: price,
      ownerType: "member",
      ownerMemberId: winnerMember.id,
      status: "owned",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    next = {
      ...next,
      items: exists ? next.items.map((candidate) => (candidate.id === itemId ? item : candidate)) : [...next.items, item],
      members: next.members.map((member) =>
        member.id === winnerMember.id
          ? { ...member, itemIds: Array.from(new Set([...member.itemIds, itemId])), updatedAt: new Date().toISOString() }
          : member,
      ),
    };
  }
  const receiverText = winnerMember ? `受け取り: ${winnerMember.name}。` : "";
  next = addEventLog(next, `${team.name}が「${auctionItem.name}」を${price}沖コインで落札しました。${receiverText}`, "auction");
  next = addNotification(next, "オークション落札", `${team.name}が「${auctionItem.name}」を落札！${winnerMember ? ` ${winnerMember.name}の物資に追加。` : ""}`, "auction");
  return next;
}
