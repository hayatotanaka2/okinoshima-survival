import { distributeRewardToTeam } from "./coinLogic";
import { addEventLog, addNotification, uid } from "./gameLogic";
import type { GameState, Mission, MissionDifficulty, MissionStatus, MissionSubmission, MissionTargetType } from "./types";

export type MissionInput = {
  title: string;
  description: string;
  rewardPoint: number;
  rewardCoin: number;
  difficulty: MissionDifficulty;
  targetType: MissionTargetType;
};

export function createMission(state: GameState, input: MissionInput): GameState {
  const mission: Mission = {
    id: uid("mission"),
    title: input.title.trim(),
    description: input.description.trim(),
    rewardPoint: input.rewardPoint,
    rewardCoin: input.rewardCoin,
    difficulty: input.difficulty,
    status: "draft",
    targetType: input.targetType,
    rewardItemIds: [],
    completedByTeamIds: [],
    completedByMemberIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return addEventLog({ ...state, missions: [...state.missions, mission] }, `ミッション「${mission.title}」を作成しました。`, "mission");
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
          rewardPoint: input.rewardPoint,
          rewardCoin: input.rewardCoin,
          difficulty: input.difficulty,
          targetType: input.targetType,
          updatedAt: new Date().toISOString(),
        }
      : candidate,
  );

  return addEventLog({ ...state, missions }, `ミッション「${mission.title}」を編集しました。`, "mission");
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

export function setMissionStatus(state: GameState, missionId: string, status: MissionStatus): GameState {
  const mission = state.missions.find((candidate) => candidate.id === missionId);
  const missions = state.missions.map((candidate) =>
    candidate.id === missionId
      ? { ...candidate, status, updatedAt: new Date().toISOString() }
      : candidate,
  );
  let next = addEventLog({ ...state, missions }, `ミッション「${mission?.title ?? ""}」を${status}にしました。`, "mission");
  if (status === "active" && mission) {
    next = addNotification(next, "新ミッション発動", mission.title, "mission");
  }
  return next;
}

export function completeMissionForTeam(state: GameState, missionId: string, teamId: string): GameState {
  const mission = state.missions.find((candidate) => candidate.id === missionId);
  const team = state.teams.find((candidate) => candidate.id === teamId);
  if (!mission || !team || mission.completedByTeamIds.includes(teamId)) return state;

  const missions = state.missions.map((candidate) =>
    candidate.id === missionId
      ? {
          ...candidate,
          status: "completed" as const,
          completedByTeamIds: [...candidate.completedByTeamIds, teamId],
          updatedAt: new Date().toISOString(),
        }
      : candidate,
  );

  const teams = state.teams.map((candidate) =>
    candidate.id === teamId
      ? { ...candidate, point: candidate.point + mission.rewardPoint, updatedAt: new Date().toISOString() }
      : candidate,
  );

  let next = distributeRewardToTeam({ ...state, missions, teams }, teamId, mission.rewardCoin);
  next = addEventLog(next, `${team.name}が「${mission.title}」を達成しました。`, "mission");
  next = addNotification(next, "ミッション達成", `${team.name}が「${mission.title}」を達成！`, "mission");
  return next;
}

export type MissionSubmissionInput = {
  missionId: string;
  teamId: string;
  submittedByMemberId: string;
  imageUrl: string;
  comment: string;
};

export function createMissionSubmission(state: GameState, input: MissionSubmissionInput): GameState {
  const mission = state.missions.find((candidate) => candidate.id === input.missionId);
  const team = state.teams.find((candidate) => candidate.id === input.teamId);
  const member = state.members.find((candidate) => candidate.id === input.submittedByMemberId);
  if (!mission || !team || !member || !input.imageUrl) return state;

  const submission: MissionSubmission = {
    id: uid("submission"),
    missionId: input.missionId,
    teamId: input.teamId,
    submittedByMemberId: input.submittedByMemberId,
    imageUrl: input.imageUrl,
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
