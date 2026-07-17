import { distributeRewardToTeam } from "./coinLogic";
import { addEventLog, addNotification, uid } from "./gameLogic";
import { getVisibleRewardName } from "./itemVisibility";
import type {
  GameState,
  Item,
  Mission,
  MissionCategory,
  MissionDifficulty,
  MissionItemReward,
  MissionRequirement,
  MissionRewardKind,
  MissionRewardMode,
  MissionRankingReward,
  MissionStatus,
  MissionSubmission,
  MissionTargetType,
  Team,
} from "./types";

export type MissionInput = {
  title: string;
  description: string;
  rewardCoin: number;
  difficulty: MissionDifficulty;
  targetType: MissionTargetType;
  category: MissionCategory;
  requirement: MissionRequirement;
  requiresPhoto: boolean;
  requiresCode: boolean;
  treasureCode: string;
  rewardKind: MissionRewardKind;
  rewardMode: MissionRewardMode;
  rewardItem?: MissionItemReward;
  rankingRewards: MissionRankingReward[];
};

export function createMission(state: GameState, input: MissionInput): GameState {
  const isEmergency = input.category === "emergency-treasure" || input.category === "emergency-battle";
  const mission: Mission = {
    id: uid("mission"),
    title: input.title.trim(),
    description: input.description.trim(),
    rewardCoin: input.rewardCoin,
    difficulty: input.difficulty,
    status: "active",
    targetType: input.targetType,
    category: input.category,
    requirement: input.category.startsWith("emergency") ? "required" : input.requirement,
    requiresPhoto: input.requiresPhoto,
    requiresCode: input.requiresCode,
    treasureCode: input.treasureCode.trim().toUpperCase() || undefined,
    rewardKind: input.rewardKind,
    rewardMode: input.rewardMode,
    rewardItem: input.rewardItem,
    rankingRewards: input.rankingRewards,
    isEmergency,
    rewardItemIds: [],
    completedByTeamIds: [],
    completedTeamRecords: [],
    completedByMemberIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  let next = addEventLog({ ...state, missions: [...state.missions, mission] }, `ミッション「${mission.title}」を作成し、発令しました。`, "mission");
  next = addNotification(next, isEmergency ? "緊急ミッション発令" : "新ミッション発動", mission.title, "mission");
  return next;
}

export function updateMission(state: GameState, missionId: string, input: MissionInput): GameState {
  const mission = state.missions.find((candidate) => candidate.id === missionId);
  if (!mission) return state;

  const missions = state.missions.map((candidate) =>
    candidate.id === missionId
      ? {
          ...candidate,
          title: input.title.trim(),
          description: input.description.trim(),
          rewardCoin: input.rewardCoin,
          difficulty: input.difficulty,
          targetType: input.targetType,
          category: input.category,
          requirement: input.category.startsWith("emergency") ? "required" : input.requirement,
          requiresPhoto: input.requiresPhoto,
          requiresCode: input.requiresCode,
          treasureCode: input.treasureCode.trim().toUpperCase() || undefined,
          rewardKind: input.rewardKind,
          rewardMode: input.rewardMode,
          rewardItem: input.rewardItem,
          rankingRewards: input.rankingRewards,
          isEmergency: input.category === "emergency-treasure" || input.category === "emergency-battle" ? candidate.isEmergency : false,
          updatedAt: new Date().toISOString(),
        }
      : candidate,
  );

  return addEventLog({ ...state, missions }, `ミッション「${mission.title}」を編集しました。`, "mission");
}

export function isMissionCompletedByTeam(mission: Mission, team?: Team): boolean {
  if (!team) return false;
  return (mission.completedTeamRecords ?? []).some(
    (record) => record.teamId === team.id && record.completedAt >= team.createdAt,
  );
}

export function deleteMission(state: GameState, missionId: string): GameState {
  const mission = state.missions.find((candidate) => candidate.id === missionId);
  if (!mission) return state;
  return addEventLog(
    { ...state, missions: state.missions.filter((candidate) => candidate.id !== missionId) },
    `ミッション「${mission.title}」を削除しました。`,
    "mission",
  );
}

export function setMissionStatus(state: GameState, missionId: string, status: MissionStatus, emergency = false): GameState {
  const mission = state.missions.find((candidate) => candidate.id === missionId);
  const missions = state.missions.map((candidate) =>
    candidate.id === missionId
      ? {
          ...candidate,
          status,
          isEmergency: status === "active" ? emergency : candidate.isEmergency,
          updatedAt: new Date().toISOString(),
        }
      : candidate,
  );
  let next = addEventLog({ ...state, missions }, `ミッション「${mission?.title ?? ""}」を${status}にしました。`, "mission");
  if (status === "active" && mission) {
    next = addNotification(next, emergency ? "緊急ミッション発令" : "新ミッション発動", mission.title, "mission");
  }
  return next;
}

export function completeMissionForTeam(state: GameState, missionId: string, teamId: string): GameState {
  const mission = state.missions.find((candidate) => candidate.id === missionId);
  const team = state.teams.find((candidate) => candidate.id === teamId);
  if (!mission || !team) return state;
  if (isMissionCompletedByTeam(mission, team)) return state;

  const missions = state.missions.map((candidate) =>
    candidate.id === missionId
      ? {
          ...candidate,
          completedByTeamIds: Array.from(new Set([...candidate.completedByTeamIds, teamId])),
          completedTeamRecords: [
            ...(candidate.completedTeamRecords ?? []),
            { teamId, completedAt: new Date().toISOString() },
          ],
          updatedAt: new Date().toISOString(),
        }
      : candidate,
  );

  let next = applySameRewardToTeam({ ...state, missions }, mission, team);
  const message = `${team.name}がミッション「${mission.title}」を達成しました。${rewardSummary(mission, team)}`;
  next = addEventLog(next, message, "mission");
  next = addNotification(next, "ミッション達成", message, "mission");
  return next;
}

function completeMissionForTeamWithReward(state: GameState, mission: Mission, team: Team, rank?: number): GameState {
  if (isMissionCompletedByTeam(mission, team)) return state;

  const missions = state.missions.map((candidate) =>
    candidate.id === mission.id
      ? {
          ...candidate,
          completedByTeamIds: Array.from(new Set([...candidate.completedByTeamIds, team.id])),
          completedTeamRecords: [
            ...(candidate.completedTeamRecords ?? []),
            { teamId: team.id, completedAt: new Date().toISOString(), rank },
          ],
          updatedAt: new Date().toISOString(),
        }
      : candidate,
  );

  let next = applySameRewardToTeam({ ...state, missions }, mission, team);
  const rankText = rank ? `${rank}位として` : "";
  const message = `${team.name}が${rankText}ミッション「${mission.title}」を達成しました。${rewardSummary(mission, team)}`;
  next = addEventLog(next, message, "mission");
  next = addNotification(next, "ミッション達成", message, "mission");
  return next;
}

function rewardSummary(mission: Mission, team: Team): string {
  if ((mission.rewardKind ?? "coin") === "item" && mission.rewardItem) {
    return `各メンバーに「${getVisibleRewardName(mission.rewardItem)}」を1枚配布しました。`;
  }
  const rewardPerMember = team.memberIds.length > 0 ? Math.floor(mission.rewardCoin / team.memberIds.length) : 0;
  return `各メンバーに${rewardPerMember}沖コインを配布しました。`;
}

function applySameRewardToTeam(state: GameState, mission: Mission, team: Team): GameState {
  if ((mission.rewardKind ?? "coin") === "item" && mission.rewardItem) {
    return distributeItemRewardToTeam(state, mission, team, mission.rewardItem);
  }
  return distributeRewardToTeam(state, team.id, mission.rewardCoin);
}

function distributeItemRewardToTeam(state: GameState, mission: Mission, team: Team, reward: MissionItemReward): GameState {
  const now = new Date().toISOString();
  const newItems: Item[] = team.memberIds.map((memberId) => ({
    id: uid("mission-item"),
    name: reward.name,
    description: reward.description || `ミッション「${mission.title}」の報酬です。`,
    type: reward.type,
    value: reward.value,
    isSecret: reward.isSecret ?? false,
    publicName: reward.publicName,
    ownerType: "member",
    ownerMemberId: memberId,
    acquiredTeamId: team.id,
    status: "owned",
    createdAt: now,
    updatedAt: now,
  }));

  const itemsByMember = new Map(newItems.map((item) => [item.ownerMemberId, item.id]));
  const members = state.members.map((member) => {
    const itemId = itemsByMember.get(member.id);
    return itemId ? { ...member, itemIds: Array.from(new Set([...member.itemIds, itemId])), updatedAt: now } : member;
  });

  return { ...state, items: [...state.items, ...newItems], members };
}

export type MissionSubmissionInput = {
  missionId: string;
  teamId: string;
  submittedByMemberId: string;
  imageUrl: string;
  imageUrls: string[];
  comment: string;
};

export function createMissionSubmission(state: GameState, input: MissionSubmissionInput): GameState {
  const mission = state.missions.find((candidate) => candidate.id === input.missionId);
  const team = state.teams.find((candidate) => candidate.id === input.teamId);
  const member = state.members.find((candidate) => candidate.id === input.submittedByMemberId);
  if (!mission || !team || !member || !input.imageUrl) return state;
  if (mission.status !== "active" || isMissionCompletedByTeam(mission, team)) return state;

  const submission: MissionSubmission = {
    id: uid("submission"),
    missionId: input.missionId,
    teamId: input.teamId,
    submittedByMemberId: input.submittedByMemberId,
    imageUrl: input.imageUrls[0] ?? input.imageUrl,
    imageUrls: input.imageUrls.length > 0 ? input.imageUrls : [input.imageUrl].filter(Boolean),
    comment: input.comment.trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const message = `${member.name}が${team.name}の「${mission.title}」達成写真を投稿しました。`;
  return addNotification(
    addEventLog({ ...state, submissions: [submission, ...state.submissions] }, message, "mission"),
    "写真投稿",
    message,
    "mission",
  );
}

export function claimMissionTreasureCode(state: GameState, missionId: string, teamId: string, memberId: string, code: string): GameState {
  const mission = state.missions.find((candidate) => candidate.id === missionId);
  const team = state.teams.find((candidate) => candidate.id === teamId);
  const member = state.members.find((candidate) => candidate.id === memberId);
  if (!mission || !team || !member || mission.status !== "active" || !mission.requiresCode) return state;
  if (isMissionCompletedByTeam(mission, team)) return state;
  if ((mission.treasureCode ?? "").toUpperCase() !== code.trim().toUpperCase()) return state;
  return completeMissionForTeam(state, missionId, teamId);
}

export function applyRankingRewards(state: GameState, missionId: string, rankedTeamIds: string[]): GameState {
  const mission = state.missions.find((candidate) => candidate.id === missionId);
  if (!mission || mission.rewardMode !== "ranking") return state;

  let next = state;
  rankedTeamIds.forEach((teamId, index) => {
    const team = next.teams.find((candidate) => candidate.id === teamId);
    const reward = mission.rankingRewards?.find((candidate) => candidate.rank === index + 1);
    if (!team || !reward || isMissionCompletedByTeam(mission, team)) return;
    const missionWithReward: Mission = {
      ...mission,
      rewardKind: reward.rewardKind,
      rewardCoin: reward.rewardCoin,
      rewardItem: reward.rewardItem,
    };
    next = completeMissionForTeamWithReward(next, missionWithReward, team, index + 1);
  });
  return next;
}

export function approveMissionSubmission(state: GameState, submissionId: string): GameState {
  const submission = state.submissions.find((candidate) => candidate.id === submissionId);
  if (!submission || submission.status !== "pending") return state;

  const submissions = state.submissions.map((candidate) =>
    candidate.id === submissionId
      ? { ...candidate, status: "approved" as const, updatedAt: new Date().toISOString() }
      : candidate,
  );

  return completeMissionForTeam({ ...state, submissions }, submission.missionId, submission.teamId);
}

export function rejectMissionSubmission(state: GameState, submissionId: string): GameState {
  const submission = state.submissions.find((candidate) => candidate.id === submissionId);
  if (!submission || submission.status !== "pending") return state;

  const mission = state.missions.find((candidate) => candidate.id === submission.missionId);
  const submissions = state.submissions.map((candidate) =>
    candidate.id === submissionId
      ? { ...candidate, status: "rejected" as const, updatedAt: new Date().toISOString() }
      : candidate,
  );
  const message = `「${mission?.title ?? "ミッション"}」の写真投稿を差し戻しました。`;
  return addNotification(addEventLog({ ...state, submissions }, message, "mission"), "写真差し戻し", message, "mission");
}
