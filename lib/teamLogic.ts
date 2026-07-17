import { addEventLog, uid } from "./gameLogic";
import type { GameState, Member, Team } from "./types";

const teamNames = ["赤チーム", "青チーム", "黄チーム", "緑チーム", "紫チーム", "白チーム"];
const teamColors = ["#ff2b93", "#00bfd6", "#ffd83d", "#a8e600", "#6d4aff", "#ff7a45"];

export function calculateTeamCoin(team: Team, members: Member[]): number {
  return team.memberIds.reduce((sum, memberId) => {
    return sum + (members.find((member) => member.id === memberId)?.coin ?? 0);
  }, 0);
}

export function randomizeTeams(state: GameState, teamCount: number): GameState {
  const safeTeamCount = Math.max(2, Math.min(teamCount, 6));
  const shuffled = [...state.members].sort(() => Math.random() - 0.5);

  const teams: Team[] = Array.from({ length: safeTeamCount }, (_, index) => ({
    id: `team-${index + 1}`,
    name: teamNames[index] ?? `チーム${index + 1}`,
    color: teamColors[index] ?? "#19b7a6",
    memberIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  shuffled.forEach((member, index) => {
    teams[index % safeTeamCount].memberIds.push(member.id);
  });

  const members = state.members.map((member) => {
    const team = teams.find((candidate) => candidate.memberIds.includes(member.id));
    return { ...member, currentTeamId: team?.id, updatedAt: new Date().toISOString() };
  });

  return addEventLog(
    {
      ...state,
      members,
      teams,
      gameStatus: "playing",
    },
    `${safeTeamCount}チームにランダム編成しました。`,
    "team",
  );
}

export function addTeam(state: GameState, name: string, color = "#00bfd6"): GameState {
  const team: Team = {
    id: uid("team"),
    name,
    color,
    memberIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return addEventLog({ ...state, teams: [...state.teams, team] }, `${name}を追加しました。`, "team");
}

export function updateTeam(state: GameState, teamId: string, name: string, color: string): GameState {
  const team = state.teams.find((candidate) => candidate.id === teamId);
  if (!team) return state;
  const teams = state.teams.map((candidate) =>
    candidate.id === teamId
      ? { ...candidate, name: name.trim(), color, updatedAt: new Date().toISOString() }
      : candidate,
  );
  return addEventLog({ ...state, teams }, `${team.name}を編集しました。`, "team");
}

export function deleteTeam(state: GameState, teamId: string): GameState {
  const team = state.teams.find((candidate) => candidate.id === teamId);
  if (!team) return state;
  const teams = state.teams.filter((candidate) => candidate.id !== teamId);
  const members = state.members.map((member) =>
    member.currentTeamId === teamId ? { ...member, currentTeamId: undefined, updatedAt: new Date().toISOString() } : member,
  );
  const items = state.items.map((item) =>
    item.ownerTeamId === teamId
      ? { ...item, ownerType: "none" as const, ownerTeamId: undefined, status: "available" as const, updatedAt: new Date().toISOString() }
      : item,
  );
  return addEventLog({ ...state, teams, members, items }, `${team.name}を削除しました。`, "team");
}

export function moveMemberToTeam(state: GameState, memberId: string, teamId: string): GameState {
  const member = state.members.find((candidate) => candidate.id === memberId);
  const team = state.teams.find((candidate) => candidate.id === teamId);
  if (!member || !team) return state;

  const teams = state.teams.map((candidate) => ({
    ...candidate,
    memberIds:
      candidate.id === teamId
        ? Array.from(new Set([...candidate.memberIds, memberId]))
        : candidate.memberIds.filter((id) => id !== memberId),
    updatedAt: new Date().toISOString(),
  }));
  const members = state.members.map((candidate) =>
    candidate.id === memberId ? { ...candidate, currentTeamId: teamId, updatedAt: new Date().toISOString() } : candidate,
  );

  return addEventLog({ ...state, teams, members }, `${member.name}を${team.name}へ移動しました。`, "team");
}
