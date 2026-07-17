"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGameState } from "@/lib/useGameState";
import { useSelectedMember } from "@/lib/useSelectedMember";
import type { Mission, MissionTeamCompletion, Team } from "@/lib/types";

const ALERT_DURATION_MS = 5400;

type CompletionTarget = {
  mission: Mission;
  team: Team;
  record: MissionTeamCompletion;
};

function seenKey(target: CompletionTarget) {
  return `bokura-mission-complete-seen:${target.mission.id}:${target.team.id}:${target.record.completedAt}`;
}

export function MissionCompletionAlert() {
  const { state } = useGameState();
  const { selectedMember } = useSelectedMember(state);
  const [target, setTarget] = useState<CompletionTarget | null>(null);
  const sessionSeenKeys = useRef(new Set<string>());

  const nextTarget = useMemo(() => {
    if (!state || !selectedMember?.currentTeamId || typeof window === "undefined") return null;
    const team = state.teams.find((candidate) => candidate.id === selectedMember.currentTeamId);
    if (!team || !team.memberIds.includes(selectedMember.id)) return null;

    const candidates = state.missions.flatMap((mission) =>
      (mission.completedTeamRecords ?? [])
        .filter((record) => record.teamId === team.id && record.completedAt >= team.createdAt)
        .map((record) => ({ mission, team, record })),
    );

    return candidates
      .sort((a, b) => Date.parse(b.record.completedAt) - Date.parse(a.record.completedAt))
      .find((candidate) => {
        const key = seenKey(candidate);
        return !sessionSeenKeys.current.has(key) && !window.localStorage.getItem(key);
      }) ?? null;
  }, [selectedMember, state]);

  useEffect(() => {
    if (!target && nextTarget) {
      const key = seenKey(nextTarget);
      sessionSeenKeys.current.add(key);
      window.localStorage.setItem(key, "1");
      setTarget(nextTarget);
    }
  }, [nextTarget, target]);

  useEffect(() => {
    if (!target) return;
    const timer = window.setTimeout(() => dismiss(target), ALERT_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [target]);

  function dismiss(current: CompletionTarget) {
    const key = seenKey(current);
    sessionSeenKeys.current.add(key);
    window.localStorage.setItem(key, "1");
    setTarget(null);
  }

  if (!target) return null;

  return (
    <div className="mission-complete-overlay fixed inset-0 z-[58] grid place-items-center overflow-hidden bg-white/92 px-4" role="dialog" aria-modal="true" aria-label="ミッション達成">
      <div className="mission-complete-rays absolute inset-0 opacity-80" />
      <div className="absolute inset-x-0 top-[17%] rotate-[-3deg] bg-lagoon py-2 text-center text-sm font-black tracking-[0.28em] text-ink shadow-lg">
        MISSION CLEAR MISSION CLEAR
      </div>
      <section className="mission-complete-card relative z-10 w-full max-w-sm overflow-hidden rounded-md border-4 border-lagoon bg-white text-center shadow-[0_26px_80px_rgba(0,191,214,0.28)]">
        <div className="grid h-32 place-items-center bg-gradient-to-r from-lagoon via-white to-lime">
          <div className="mission-complete-stamp rounded-md border-4 border-white bg-ember px-5 py-3 text-3xl font-black text-white shadow-lg">
            達成!!!
          </div>
        </div>
        <div className="p-5">
          <p className="text-xs font-black tracking-[0.2em] text-reef">MISSION COMPLETE</p>
          <h2 className="mt-2 text-2xl font-black text-ink">{target.team.name} 達成</h2>
          <p className="mt-3 rounded-md bg-cyan-50 p-3 text-lg font-black text-ink">{target.mission.title}</p>
          <button className="mt-4 min-h-11 w-full rounded-md bg-lagoon px-4 py-2 text-sm font-black text-ink" onClick={() => dismiss(target)}>
            確認する
          </button>
        </div>
      </section>
    </div>
  );
}
