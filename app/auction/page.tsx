"use client";

import { useState } from "react";
import { Card, Field, PrimaryButton, inputClass } from "@/components/Cards";
import { Shell } from "@/components/Shell";
import { placeAuctionBid } from "@/lib/auctionLogic";
import { useGameState } from "@/lib/useGameState";

export default function AuctionPage() {
  const { state, updateState } = useGameState();
  const [bidTeamId, setBidTeamId] = useState("");
  const [bidPrices, setBidPrices] = useState<Record<string, number>>({});
  if (!state) return <Shell title="オークション"><p>読み込み中...</p></Shell>;

  return (
    <Shell title="オークション">
      <div className="grid gap-3">
        <Card>
          <Field>
            入札チーム
            <select className={inputClass} value={bidTeamId} onChange={(event) => setBidTeamId(event.target.value)}>
              <option value="">選択してください</option>
              {state.teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </Field>
          <p className="mt-2 text-sm text-slate-400">現在価格より高い金額で入札できます。最終落札処理は管理者が行います。</p>
        </Card>

        {state.auctionItems.map((item) => {
          const team = state.teams.find((candidate) => candidate.id === item.winnerTeamId);
          const bidPrice = bidPrices[item.id] ?? item.currentPrice + 100;
          return (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-black">{item.name}</h2>
                <span className="rounded-md bg-lagoon px-2 py-1 text-xs font-black text-ink">
                  {item.status === "open" ? "開催中" : "落札済"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
              <p className="mt-3 text-xl font-black text-ember">{item.currentPrice}沖</p>
              <p className="mt-1 text-sm text-slate-400">{item.status === "open" ? "最高入札" : "落札"}チーム: {team?.name ?? "未定"}</p>
              <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                <input
                  className={inputClass}
                  type="number"
                  value={bidPrice}
                  min={item.currentPrice + 1}
                  onChange={(event) => setBidPrices((current) => ({ ...current, [item.id]: Number(event.target.value) }))}
                />
                <PrimaryButton
                  disabled={!bidTeamId || item.status !== "open" || bidPrice <= item.currentPrice}
                  onClick={() => updateState((current) => placeAuctionBid(current, item.id, bidTeamId, bidPrice))}
                >
                  入札
                </PrimaryButton>
              </div>
            </Card>
          );
        })}
      </div>
    </Shell>
  );
}
