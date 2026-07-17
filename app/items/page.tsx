"use client";

import { useState } from "react";
import { Card, Field, PrimaryButton, inputClass } from "@/components/Cards";
import { Shell } from "@/components/Shell";
import { useItem } from "@/lib/itemLogic";
import { useGameState } from "@/lib/useGameState";

export default function ItemsPage() {
  const { state, updateState } = useGameState();
  const [actorMemberId, setActorMemberId] = useState("");
  if (!state) return <Shell title="物資"><p>読み込み中...</p></Shell>;

  const actor = state.members.find((member) => member.id === actorMemberId);

  return (
    <Shell title="物資">
      <div className="grid gap-3">
        <Card>
          <Field>
            操作するメンバー
            <select className={inputClass} value={actorMemberId} onChange={(event) => setActorMemberId(event.target.value)}>
              <option value="">選択してください</option>
              {state.members.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </Field>
          <p className="mt-2 text-sm text-slate-400">自分または所属チームの所有物資を使用できます。</p>
        </Card>

        {state.items.map((item) => {
          const ownerMember = state.members.find((member) => member.id === item.ownerMemberId);
          const ownerTeam = state.teams.find((team) => team.id === item.ownerTeamId);
          const canUse =
            actor &&
            item.status === "owned" &&
            (item.ownerMemberId === actor.id || item.ownerTeamId === actor.currentTeamId);
          return (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-black">{item.name}</h2>
                <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-bold">{item.status}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
              <p className="mt-3 text-sm text-lagoon">価値: {item.value}沖</p>
              <p className="mt-1 text-sm text-slate-400">種類: {item.type}</p>
              <p className="mt-1 text-sm text-slate-400">所有者: {ownerMember?.name ?? ownerTeam?.name ?? "未取得"}</p>
              <div className="mt-3">
                <PrimaryButton
                  disabled={!canUse}
                  onClick={() => actor && updateState((current) => useItem(current, item.id, actor.name))}
                >
                  使用する
                </PrimaryButton>
              </div>
            </Card>
          );
        })}
      </div>
    </Shell>
  );
}
