import type { Item, MissionItemReward } from "./types";

export function getPublicItemName(item: Pick<Item, "publicName" | "name">): string {
  return item.publicName?.trim() || "秘匿カード";
}

export function canRevealItem(item: Pick<Item, "isSecret" | "ownerMemberId">, viewerMemberId?: string): boolean {
  return !item.isSecret || (!!viewerMemberId && item.ownerMemberId === viewerMemberId);
}

export function getVisibleItemName(item: Pick<Item, "isSecret" | "ownerMemberId" | "publicName" | "name">, viewerMemberId?: string): string {
  if (!item.isSecret) return item.name;
  const publicName = getPublicItemName(item);
  return canRevealItem(item, viewerMemberId) ? `${publicName}（${item.name}）` : publicName;
}

export function getVisibleItemDescription(item: Pick<Item, "isSecret" | "ownerMemberId" | "description">, viewerMemberId?: string): string {
  if (canRevealItem(item, viewerMemberId)) return item.description;
  return "取得した本人だけが内容を確認できます。";
}

export function getVisibleRewardName(reward: MissionItemReward | undefined, reveal = false): string {
  if (!reward) return "カード報酬";
  if (!reward.isSecret) return reward.name;
  const publicName = reward.publicName?.trim() || "秘匿カード";
  return reveal ? `${publicName}（${reward.name}）` : publicName;
}
