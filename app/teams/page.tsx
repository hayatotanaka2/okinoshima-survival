"use client";

import Link from "next/link";
import { Card, Stat } from "@/components/Cards";
import { Shell } from "@/components/Shell";
import { calculateTeamCoin } from "@/lib/teamLogic";
import { useGameState } from "@/lib/useGameState";

export default function TeamsPage() {
  const { state } = useGameState();
  if (!state) return <Shell title="チーム"><p>読み込み中...</p></Shell>;

  return (
    <Shell title="チーム">
      <div className="mb-4">
        <Link href="/teams/compose" className="block rounded-md bg-lagoon px-4 py-3 text-center text-sm font-black text-ink shadow-[0_8px_22px_rgba(0,191,214,0.18)]">
          チーム編成へ
        </Link>
      </div>
      <div className="grid gap-4">
        {state.teams.length === 0 && <Card>まだチームがありません。</Card>}
        {state.teams.map((team) => {
          const members = state.members.filter((member) => team.memberIds.includes(member.id));
          const items = state.items.filter((item) => item.ownerTeamId === team.id);
          const completed = state.missions.filter((mission) => mission.completedByTeamIds.includes(team.id));
          return (
            <Card key={team.id}>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-sm" style={{ background: team.color }} />
                <h2 className="text-xl font-black">{team.name}</h2>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Stat label="人数" value={`${members.length}`} />
                <Stat label="合計沖" value={calculateTeamCoin(team, state.members)} />
              </div>
              <div className="mt-4">
                <p className="text-sm font-black text-lagoon">メンバー</p>
                <p className="mt-1 text-sm text-slate-200">{members.map((member) => member.name).join("、") || "未設定"}</p>
              </div>
              <p className="mt-4 text-sm text-slate-300">物資: {items.map((item) => item.name).join("、") || "なし"}</p>
              <p className="mt-2 text-sm text-slate-300">達成: {completed.map((mission) => mission.title).join("、") || "なし"}</p>
            </Card>
          );
        })}
      </div>
    </Shell>
  );
}
