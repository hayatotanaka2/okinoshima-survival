"use client";

import { FormEvent, useState } from "react";
import { Card, Field, PrimaryButton, inputClass } from "@/components/Cards";
import { Shell } from "@/components/Shell";
import { claimTreasureByCode } from "@/lib/treasureLogic";
import { useGameState } from "@/lib/useGameState";

export default function QrPage() {
  const { state, updateState } = useGameState();
  const [code, setCode] = useState("");
  const [memberId, setMemberId] = useState("");

  if (!state) return <Shell title="宝箱"><p>読み込み中...</p></Shell>;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!memberId || !code) return;
    updateState((current) => claimTreasureByCode(current, code, memberId));
    setCode("");
  }

  return (
    <Shell title="宝箱">
      <div className="grid gap-4">
        <Card>
          <form className="grid gap-3" onSubmit={submit}>
            <Field>
              宝箱コード
              <input className={inputClass} value={code} onChange={(event) => setCode(event.target.value)} placeholder="OKI-001" />
            </Field>
            <Field>
              取得者
              <select className={inputClass} value={memberId} onChange={(event) => setMemberId(event.target.value)}>
                <option value="">選択してください</option>
                {state.members.map((member) => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </Field>
            <PrimaryButton type="submit">報酬を受け取る</PrimaryButton>
          </form>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-black">宝箱一覧</h2>
          <div className="grid gap-2">
            {state.treasures.map((treasure) => {
              const member = state.members.find((candidate) => candidate.id === treasure.claimedByMemberId);
              return (
                <div key={treasure.id} className="rounded-md bg-slate-950/50 p-3">
                  <p className="font-black">{treasure.title}</p>
                  <p className="text-sm text-slate-400">{treasure.status === "claimed" ? `取得済み: ${member?.name ?? ""}` : "未発見"}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
