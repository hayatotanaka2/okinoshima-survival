"use client";

import { createInitialGameState, officialMemberNames, seedMembers } from "./seed";
import type { GameState, Member } from "./types";

const STORAGE_KEY = "okinoshima-survival-state";
const SELECTED_MEMBER_KEY = "okinoshima-survival-selected-member";

export function loadGameState(): GameState {
  if (typeof window === "undefined") {
    return createInitialGameState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initialState = createInitialGameState();
    saveGameState(initialState);
    return initialState;
  }

  try {
    return normalizeGameState(JSON.parse(raw) as GameState);
  } catch {
    const initialState = createInitialGameState();
    saveGameState(initialState);
    return initialState;
  }
}

export function normalizeGameState(state: GameState): GameState {
  const members = normalizeMembers(state.members ?? []);
  const validMemberIds = new Set(members.map((member) => member.id));
  const teams = (state.teams ?? []).map((team) => ({
    ...team,
    memberIds: team.memberIds.filter((memberId) => validMemberIds.has(memberId)),
  }));
  const items = (state.items ?? []).map((item) => {
    const normalizedItem = {
      ...item,
      isSecret: item.isSecret ?? false,
      publicName: item.publicName,
    };
    if (item.ownerMemberId && !validMemberIds.has(item.ownerMemberId)) {
      return {
        ...normalizedItem,
        ownerType: "none" as const,
        ownerMemberId: undefined,
        ownerTeamId: undefined,
        status: "available" as const,
      };
    }
    return normalizedItem;
  });
  const missions = (state.missions ?? []).map((mission) => ({
    ...mission,
    status: mission.status === "completed" ? ("active" as const) : mission.status,
    category: mission.category ?? "single",
    requirement: mission.requirement ?? "optional",
    requiresPhoto: mission.requiresPhoto ?? true,
    requiresCode: mission.requiresCode ?? false,
    rewardKind: mission.rewardKind ?? "coin",
    rewardMode: mission.rewardMode ?? "same",
    rewardItem: mission.rewardItem
      ? {
          ...mission.rewardItem,
          isSecret: mission.rewardItem.isSecret ?? false,
          publicName: mission.rewardItem.publicName,
        }
      : undefined,
    rankingRewards: (mission.rankingRewards ?? []).map((reward) => ({
      ...reward,
      rewardItem: reward.rewardItem
        ? {
            ...reward.rewardItem,
            isSecret: reward.rewardItem.isSecret ?? false,
            publicName: reward.rewardItem.publicName,
          }
        : undefined,
    })),
    completedTeamRecords:
      mission.completedTeamRecords?.length
        ? mission.completedTeamRecords
        : (mission.completedByTeamIds ?? []).map((teamId) => ({
            teamId,
            completedAt: mission.updatedAt,
          })),
  }));

  const membersWithItems = members.map((member) => {
    const ownedItemIds = items
      .filter((item) => item.ownerMemberId === member.id)
      .map((item) => item.id);
    return {
      ...member,
      itemIds: Array.from(new Set([...(member.itemIds ?? []), ...ownedItemIds])),
    };
  });

  return {
    ...state,
    members: membersWithItems,
    teams,
    items,
    missions,
    eventLogs: state.eventLogs ?? [],
    notifications: state.notifications ?? [],
    treasures: state.treasures ?? [],
    submissions: (state.submissions ?? []).map((submission) => ({
      ...submission,
      imageUrls: submission.imageUrls ?? [submission.imageUrl].filter(Boolean),
    })),
  };
}

function normalizeMembers(members: Member[]): Member[] {
  const byId = new Map(members.map((member) => [member.id, member]));
  const normalized = seedMembers.map((seedMember, index) => {
    const existing = byId.get(seedMember.id);
    if (!existing) return seedMember;
    const isOldPlaceholderName = /^参加者\d+$/.test(existing.name);
    return {
      ...seedMember,
      ...existing,
      name: isOldPlaceholderName ? officialMemberNames[index] : existing.name,
      itemIds: existing.itemIds ?? [],
      updatedAt: existing.updatedAt ?? seedMember.updatedAt,
    };
  });

  const officialIds = new Set(normalized.map((member) => member.id));
  const extraMembers = members.filter((member) => !officialIds.has(member.id));
  return [...normalized, ...extraMembers];
}

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetGameState(): GameState {
  const state = createInitialGameState();
  saveGameState(state);
  return state;
}

export function loadSelectedMemberId(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(SELECTED_MEMBER_KEY) ?? "";
}

export function saveSelectedMemberId(memberId: string): void {
  if (typeof window === "undefined") return;
  if (!memberId) {
    window.localStorage.removeItem(SELECTED_MEMBER_KEY);
    return;
  }
  window.localStorage.setItem(SELECTED_MEMBER_KEY, memberId);
}
