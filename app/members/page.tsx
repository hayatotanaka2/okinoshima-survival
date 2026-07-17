"use client";

import { Card, Stat } from "@/components/Cards";
import { Shell } from "@/components/Shell";
import { useGameState } from "@/lib/useGameState";

export default function MembersPage() {
  const { state } = useGameState();
  if (!state) return <Shell title="メンバー"><p>読み込み中...</p></Shell>;

  return (
    <Shell title="メンバー">
      <div className="grid gap-3">
        {state.members.map((member) => {
          const team = state.teams.find((candidate) => candidate.id === member.currentTeamId);
          const items = state.items.filter((item) => member.itemIds.includes(item.id));
          return (
            <Card key={member.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">{member.name}</h2>
                  <p className="text-sm text-slate-400">{team?.name ?? "未所属"}</p>
                </div>
                <p className="rounded-md bg-lagoon px-3 py-1 text-sm font-black text-slate-950">{member.coin}沖</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Stat label="累計獲得" value={`${member.totalEarnedCoin}`} />
                <Stat label="累計消費" value={`${member.totalSpentCoin}`} />
              </div>
              <p className="mt-3 text-sm text-slate-300">
                所持物資: {items.length ? items.map((item) => item.name).join("、") : "なし"}
              </p>
            </Card>
          );
        })}
      </div>
    </Shell>
  );
}
