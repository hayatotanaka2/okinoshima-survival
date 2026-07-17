"use client";

import { useEffect, useState } from "react";
import { useGameState } from "@/lib/useGameState";
import type { MoraleReport } from "@/lib/types";

const ALERT_DURATION_MS = 5200;

function seenKey(report: MoraleReport) {
  return `okinoshima-judgment-seen:${report.id}:${report.updatedAt}`;
}

export function JudgmentAlert() {
  const { state } = useGameState();
  const [report, setReport] = useState<MoraleReport | null>(null);

  useEffect(() => {
    if (!state || report || typeof window === "undefined") return;

    const unseen = [...state.moraleReports]
      .filter((candidate) => candidate.verdict !== "pending" && candidate.judgedAt)
      .sort((a, b) => Date.parse(b.judgedAt ?? b.updatedAt) - Date.parse(a.judgedAt ?? a.updatedAt))
      .find((candidate) => !window.localStorage.getItem(seenKey(candidate)));

    if (unseen) setReport(unseen);
  }, [report, state]);

  useEffect(() => {
    if (!report) return;
    const timer = window.setTimeout(() => dismiss(report), ALERT_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [report]);

  function dismiss(target: MoraleReport) {
    window.localStorage.setItem(seenKey(target), "1");
    setReport(null);
  }

  if (!state || !report) return null;

  const accused = state.members.find((member) => member.id === report.accusedMemberId);
  const guilty = report.verdict === "guilty";

  return (
    <div className={`judgment-overlay fixed inset-0 z-[60] grid place-items-center overflow-hidden px-4 ${guilty ? "bg-[#130414]/94" : "bg-[#eefbff]/94"}`} role="dialog" aria-modal="true" aria-label="判決">
      <div className="judgment-speedline absolute inset-0 opacity-70" />
      <div className={`absolute inset-x-0 top-[18%] rotate-[-4deg] py-2 text-center text-sm font-black tracking-[0.32em] shadow-lg ${guilty ? "bg-ember text-white" : "bg-lagoon text-ink"}`}>
        VERDICT VERDICT VERDICT
      </div>
      <section className={`judgment-card relative z-10 w-full max-w-sm overflow-hidden rounded-md border-4 bg-white text-center shadow-[0_28px_90px_rgba(0,0,0,0.28)] ${guilty ? "border-ember" : "border-lagoon"}`}>
        <div className={`grid h-32 place-items-center ${guilty ? "bg-ember" : "bg-lagoon"}`}>
          <div className="judgment-stamp rounded-md border-4 border-white bg-black px-5 py-3 text-4xl font-black tracking-normal text-white">
            {guilty ? "GUILTY!!" : "NOT GUILTY!!"}
          </div>
        </div>
        <div className="p-5">
          <p className="text-xs font-black tracking-[0.2em] text-reef">士気裁判所</p>
          <h2 className="mt-2 text-2xl font-black text-ink">{accused?.name ?? "対象者"}への判決</h2>
          <p className="mt-3 rounded-md bg-white/80 p-3 text-sm leading-6 text-slate-300">{report.content}</p>
          {report.verdictReason && <p className="mt-3 text-sm font-black text-ink">{report.verdictReason}</p>}
          <button className={`mt-4 min-h-11 w-full rounded-md px-4 py-2 text-sm font-black ${guilty ? "bg-ember text-white" : "bg-lagoon text-ink"}`} onClick={() => dismiss(report)}>
            判決を確認
          </button>
        </div>
      </section>
    </div>
  );
}
