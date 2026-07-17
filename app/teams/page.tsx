"use client";

import { Card, Stat } from "@/components/Cards";
import { Shell } from "@/components/Shell";
import { calculateTeamCoin } from "@/lib/teamLogic";
import { useGameState } from "@/lib/useGameState";
import { useSelectedMember } from "@/lib/useSelectedMember";

export default function TeamsPage() {
  const { state } = useGameState();
  const { selectedMember } = useSelectedMember(state);
  if (!state) return <Shell title="チーム"><p>読み込み中...</p></Shell>;

  const currentTeam = state.teams.find((team) => team.id === selectedMember?.currentTeamId);

  return (
    <Shell title="チーム">
      <div className="grid gap-4">
        <section className="relative overflow-hidden rounded-md bg-ember p-4 text-white shadow-[0_14px_34px_rgba(255,43,147,0.28)]">
          <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full border-[14px] border-white/35" />
          <div className="absolute bottom-3 right-5 h-4 w-4 rounded-full bg-sun" />
          <p className="relative text-xs font-black text-white/75">YOUR TEAM</p>
          <h2 className="relative mt-1 text-2xl font-black">
            {selectedMember
              ? currentTeam
                ? `あなたは現在 ${currentTeam.name} です`
                : "あなたは現在 未所属です"
              : "トップで自分の名前を選んでください"}
          </h2>
          {selectedMember && (
            <p className="relative mt-2 text-sm font-bold text-white/80">
              {selectedMember.name} / {selectedMember.coin}沖
            </p>
          )}
        </section>

        {state.teams.length === 0 && <Card>まだチームがありません。</Card>}
        {state.teams.map((team) => {
          const members = state.members.filter((member) => team.memberIds.includes(member.id));
          const items = state.items.filter(
            (item) =>
              item.status === "owned" &&
              item.acquiredTeamId === team.id &&
              item.updatedAt >= team.createdAt &&
              item.ownerMemberId &&
              team.memberIds.includes(item.ownerMemberId),
          );
          const completed = state.missions.filter((mission) =>
            (mission.completedTeamRecords ?? []).some(
              (record) => record.teamId === team.id && record.completedAt >= team.createdAt,
            ),
          );
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
              <p className="mt-4 text-sm text-slate-300">所属メンバーが現在チームで共通獲得した物資・カード: {items.map((item) => item.name).join("、") || "なし"}</p>
              <p className="mt-2 text-sm text-slate-300">現在チームで達成したミッション: {completed.map((mission) => mission.title).join("、") || "なし"}</p>
            </Card>
          );
        })}
      </div>
    </Shell>
  );
}
