"use client";

import { useEffect, useState } from "react";
import { useGameState } from "@/lib/useGameState";
import type { Mission } from "@/lib/types";

const ALERT_DURATION_MS = 6200;

function seenKey(mission: Mission) {
  return `okinoshima-emergency-seen:${mission.id}:${mission.updatedAt}`;
}

export function EmergencyMissionAlert() {
  const { state } = useGameState();
  const [mission, setMission] = useState<Mission | null>(null);

  useEffect(() => {
    if (!state || mission || typeof window === "undefined") return;

    const unseen = [...state.missions]
      .filter((candidate) => candidate.status === "active" && candidate.isEmergency)
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      .find((candidate) => !window.localStorage.getItem(seenKey(candidate)));

    if (unseen) setMission(unseen);
  }, [mission, state]);

  useEffect(() => {
    if (!mission) return;
    const timer = window.setTimeout(() => dismiss(mission), ALERT_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [mission]);

  function dismiss(target: Mission) {
    window.localStorage.setItem(seenKey(target), "1");
    setMission(null);
  }

  if (!mission) return null;

  return (
    <div className="emergency-overlay fixed inset-0 z-50 grid place-items-center overflow-hidden bg-[#f6f3ff]/95 px-4" role="dialog" aria-modal="true" aria-label="緊急ミッション発令">
      <div className="pointer-events-none absolute inset-x-0 top-[18%] flex rotate-[-3deg] justify-center bg-ember py-2 text-center text-sm font-black tracking-[0.28em] text-white shadow-lg">
        緊急任務　緊急任務　緊急任務
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-[17%] flex rotate-[2deg] justify-center bg-reef py-2 text-center text-sm font-black tracking-[0.28em] text-white shadow-lg">
        EMERGENCY MISSION
      </div>

      <section className="emergency-panel relative z-10 w-full max-w-sm overflow-hidden rounded-md border-2 border-ember bg-white shadow-[0_24px_80px_rgba(255,43,147,0.28)]">
        <div className="relative grid h-40 place-items-center overflow-hidden bg-[#24213b]">
          <div className="emergency-orbit absolute h-28 w-28 rounded-full border-[9px] border-ember border-r-lagoon border-t-sun" />
          <div className="grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-black text-3xl font-black text-white">!</div>
          <div className="emergency-scan absolute h-0.5 w-40 bg-lagoon shadow-[0_0_16px_#00bfd6]" />
        </div>

        <div className="p-5 text-center">
          <p className="text-xs font-black tracking-[0.22em] text-ember">MISSION OVERRIDE</p>
          <h2 className="mt-2 text-2xl font-black text-ink">緊急ミッション発令</h2>
          <div className="mt-4 rounded-md border border-reef/15 bg-slate-950/60 p-4 text-left">
            <p className="text-lg font-black text-ink">{mission.title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-300">{mission.description}</p>
            <p className="mt-3 text-sm font-black text-reef">報酬 {mission.rewardCoin}沖</p>
          </div>
          <button className="mt-4 min-h-11 w-full rounded-md bg-ember px-4 py-2 text-sm font-black text-white" onClick={() => dismiss(mission)}>
            ミッションを確認する
          </button>
        </div>
        <div className="h-1.5 bg-ember/15">
          <div className="emergency-progress h-full bg-gradient-to-r from-ember via-reef to-lagoon" />
        </div>
      </section>
    </div>
  );
}
