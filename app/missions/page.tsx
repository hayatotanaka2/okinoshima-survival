"use client";

import { Card } from "@/components/Cards";
import { Shell } from "@/components/Shell";
import { useGameState } from "@/lib/useGameState";

const statusLabel = {
  draft: "未発動",
  active: "発動中",
  completed: "達成済み",
  closed: "終了",
};

export default function MissionsPage() {
  const { state } = useGameState();
  if (!state) return <Shell title="ミッション"><p>読み込み中...</p></Shell>;

  return (
    <Shell title="ミッション">
      <div className="grid gap-3">
        {state.missions.map((mission) => {
          const completedTeams = state.teams.filter((team) => mission.completedByTeamIds.includes(team.id));
          return (
            <Card key={mission.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  {mission.isEmergency && <p className="mb-1 text-xs font-black text-ember">緊急ミッション</p>}
                  <h2 className="text-lg font-black">{mission.title}</h2>
                </div>
                <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-black ${mission.status === "active" ? "bg-ember text-white" : "bg-lagoon text-ink"}`}>
                  {statusLabel[mission.status]}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{mission.description}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-sm">
                <p className="rounded-md bg-slate-950/50 p-2">{mission.difficulty}</p>
                <p className="rounded-md bg-slate-950/50 p-2">{mission.rewardCoin}沖</p>
              </div>
              <p className="mt-3 text-sm text-slate-400">
                達成チーム: {completedTeams.map((team) => team.name).join("、") || "なし"}
              </p>
            </Card>
          );
        })}
      </div>
    </Shell>
  );
}
