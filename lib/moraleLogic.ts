import { addEventLog, addNotification, uid } from "./gameLogic";
import type { GameState, MoraleReport, MoraleVerdict } from "./types";

export function createMoraleReport(
  state: GameState,
  input: {
    accusedMemberId: string;
    accuserMemberId?: string;
    content: string;
  },
): GameState {
  const accused = state.members.find((member) => member.id === input.accusedMemberId);
  const accuser = state.members.find((member) => member.id === input.accuserMemberId);
  const content = input.content.trim();
  if (!accused || !content) return state;

  const now = new Date().toISOString();
  const report: MoraleReport = {
    id: uid("morale"),
    accusedMemberId: accused.id,
    accuserMemberId: accuser?.id,
    content,
    verdict: "pending",
    createdAt: now,
    updatedAt: now,
  };

  const message = `${accuser?.name ?? "匿名"}が${accused.name}を士気下げ行動で告発しました。`;
  return addNotification(
    addEventLog({ ...state, moraleReports: [report, ...state.moraleReports] }, message, "morale"),
    "士気掲示板に告発",
    message,
    "morale",
  );
}

export function judgeMoraleReport(
  state: GameState,
  reportId: string,
  verdict: Exclude<MoraleVerdict, "pending">,
  reason: string,
): GameState {
  const report = state.moraleReports.find((candidate) => candidate.id === reportId);
  if (!report) return state;

  const accused = state.members.find((member) => member.id === report.accusedMemberId);
  const now = new Date().toISOString();
  const moraleReports = state.moraleReports.map((candidate) =>
    candidate.id === reportId
      ? {
          ...candidate,
          verdict,
          verdictReason: reason.trim(),
          judgedAt: now,
          updatedAt: now,
        }
      : candidate,
  );

  const verdictText = verdict === "guilty" ? "GUILTY!!" : "NOT GUILTY!!";
  const message = `${accused?.name ?? "対象者"}への告発に判決: ${verdictText}`;
  return addNotification(
    addEventLog({ ...state, moraleReports }, message, "morale"),
    verdictText,
    reason.trim() || message,
    "morale",
  );
}
