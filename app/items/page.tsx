"use client";

import { Card, Field, PrimaryButton, inputClass } from "@/components/Cards";
import { Shell } from "@/components/Shell";
import { getVisibleItemDescription, getVisibleItemName } from "@/lib/itemVisibility";
import { useItem } from "@/lib/itemLogic";
import { useGameState } from "@/lib/useGameState";
import { useSelectedMember } from "@/lib/useSelectedMember";

export default function ItemsPage() {
  const { state, updateState } = useGameState();
  const { selectedMemberId, selectedMember, setSelectedMemberId } = useSelectedMember(state);
  if (!state) return <Shell title="物資"><p>読み込み中...</p></Shell>;

  const actor = selectedMember;
  const visibleItems = actor ? state.items.filter((item) => item.ownerMemberId === actor.id) : [];

  return (
    <Shell title="物資">
      <div className="grid gap-3">
        <Card>
          <Field>
            操作するメンバー
            <select className={inputClass} value={selectedMemberId} onChange={(event) => setSelectedMemberId(event.target.value)}>
              <option value="">選択してください</option>
              {state.members.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </Field>
          <p className="mt-2 text-sm text-slate-400">この選択は端末に保存されます。自分の所有物資を使用できます。</p>
        </Card>

        {!actor && <Card>自分の名前を選択すると、所持している物資・カードが表示されます。</Card>}
        {actor && visibleItems.length === 0 && <Card>所持している物資・カードはまだありません。</Card>}

        {visibleItems.map((item) => {
          const ownerMember = state.members.find((member) => member.id === item.ownerMemberId);
          const ownerTeam = state.teams.find((team) => team.id === item.ownerTeamId);
          const used = item.status === "used";
          const canUse =
            actor &&
            item.status === "owned" &&
            item.ownerMemberId === actor.id;
          return (
            <Card key={item.id} className={`relative overflow-hidden ${used ? "bg-slate-100 opacity-70" : ""}`}>
              {used && (
                <>
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_47%,rgba(255,43,147,0.7)_48%,rgba(255,43,147,0.7)_52%,transparent_53%)]" />
                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <div className="-rotate-12 rounded-md border-4 border-ember bg-white/90 px-5 py-2 text-2xl font-black text-ember shadow-lg">
                      使用済み
                    </div>
                  </div>
                </>
              )}
              <div className={`relative ${used ? "grayscale" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-black">{getVisibleItemName(item, actor?.id)}</h2>
                  <span className={`rounded-md px-2 py-1 text-xs font-bold ${used ? "bg-slate-200 text-slate-500" : "bg-violet-50 text-reef"}`}>
                    {used ? "使用不可" : "所持中"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{getVisibleItemDescription(item, actor?.id)}</p>
                <p className="mt-3 text-sm text-slate-400">所有者: {ownerMember?.name ?? ownerTeam?.name ?? "未取得"}</p>
                <div className="mt-3">
                  <PrimaryButton
                    disabled={!canUse}
                    onClick={() => actor && updateState((current) => useItem(current, item.id, actor.name))}
                  >
                    使用する
                  </PrimaryButton>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Shell>
  );
}
