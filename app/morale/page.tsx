"use client";

import { FormEvent, useMemo, useState } from "react";
import { Card, Field, PrimaryButton, inputClass } from "@/components/Cards";
import { Shell } from "@/components/Shell";
import { createMoraleReport, judgeMoraleReport } from "@/lib/moraleLogic";
import { useGameState } from "@/lib/useGameState";
import { useSelectedMember } from "@/lib/useSelectedMember";
import type { MoraleReport } from "@/lib/types";

const verdictLabel = {
  pending: "審理待ち",
  guilty: "GUILTY!!",
  not_guilty: "NOT GUILTY!!",
};

export default function MoralePage() {
  const { state, updateState } = useGameState();
  const { selectedMember } = useSelectedMember(state);
  const [mode, setMode] = useState<"board" | "court">("board");
  const [accusedMemberId, setAccusedMemberId] = useState("");
  const [content, setContent] = useState("");
  const [courtAuthed, setCourtAuthed] = useState(false);
  const [courtPasscode, setCourtPasscode] = useState("");
  const [selectedReportId, setSelectedReportId] = useState("");
  const [verdictReason, setVerdictReason] = useState("");

  const selectedReport = useMemo(
    () => state?.moraleReports.find((report) => report.id === selectedReportId),
    [selectedReportId, state?.moraleReports],
  );

  if (!state) return <Shell title="士気掲示板"><p>読み込み中...</p></Shell>;

  function submitReport(event: FormEvent) {
    event.preventDefault();
    if (!accusedMemberId || !content.trim()) return;
    updateState((current) =>
      createMoraleReport(current, {
        accusedMemberId,
        accuserMemberId: selectedMember?.id,
        content,
      }),
    );
    setAccusedMemberId("");
    setContent("");
  }

  function submitCourtAuth(event: FormEvent) {
    event.preventDefault();
    setCourtAuthed(courtPasscode === "admin123");
  }

  function judge(verdict: "guilty" | "not_guilty") {
    if (!selectedReportId) return;
    updateState((current) => judgeMoraleReport(current, selectedReportId, verdict, verdictReason));
    setSelectedReportId("");
    setVerdictReason("");
  }

  return (
    <Shell title="士気掲示板">
      <div className="grid gap-4">
        <section className="relative overflow-hidden rounded-md border border-reef/15 bg-white/90 p-4 shadow-glow">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-[12px] border-ember/40 border-b-lagoon/40" />
          <p className="relative text-xs font-black text-reef">MORALE BOARD</p>
          <h2 className="relative mt-1 text-2xl font-black text-ink">波乗れてない行動、ここに記録。</h2>
          <p className="relative mt-2 text-sm leading-6 text-slate-300">
            告発は掲示板へ。判決は裁判所で幹事が下します。
          </p>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <button
            className={`min-h-14 rounded-md border px-3 py-2 text-sm font-black transition ${mode === "board" ? "border-ember bg-ember text-white shadow-[0_10px_24px_rgba(255,43,147,0.22)]" : "border-reef/10 bg-white/90 text-ink"}`}
            onClick={() => setMode("board")}
          >
            掲示板
          </button>
          <button
            className={`min-h-14 rounded-md border px-3 py-2 text-sm font-black transition ${mode === "court" ? "border-reef bg-reef text-white shadow-[0_10px_24px_rgba(67,54,130,0.2)]" : "border-reef/10 bg-white/90 text-ink"}`}
            onClick={() => setMode("court")}
          >
            裁判所
          </button>
        </div>

        {mode === "board" ? (
          <>
            <Card>
              <form className="grid gap-3" onSubmit={submitReport}>
                <Field>
                  告発対象
                  <select className={inputClass} value={accusedMemberId} onChange={(event) => setAccusedMemberId(event.target.value)}>
                    <option value="">選択してください</option>
                    {state.members.map((member) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </Field>
                <Field>
                  内容
                  <textarea
                    className={inputClass}
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="例: 乾杯のタイミングで一人だけスマホを見ていた"
                  />
                </Field>
                <PrimaryButton type="submit" disabled={!accusedMemberId || !content.trim()}>告発する</PrimaryButton>
                <p className="text-xs text-slate-400">告発者: {selectedMember?.name ?? "匿名"}。トップで自分を選ぶと名前付きで投稿できます。</p>
              </form>
            </Card>
            <MoraleReportList reports={state.moraleReports} members={state.members} />
          </>
        ) : (
          <Card>
            {!courtAuthed ? (
              <form className="grid gap-3" onSubmit={submitCourtAuth}>
                <Field>
                  裁判所パスコード
                  <input className={inputClass} type="password" value={courtPasscode} onChange={(event) => setCourtPasscode(event.target.value)} />
                </Field>
                <PrimaryButton type="submit">裁判所に入る</PrimaryButton>
              </form>
            ) : (
              <div className="grid gap-3">
                <Field>
                  告発を選択
                  <select className={inputClass} value={selectedReportId} onChange={(event) => setSelectedReportId(event.target.value)}>
                    <option value="">選択してください</option>
                    {state.moraleReports.map((report) => {
                      const accused = state.members.find((member) => member.id === report.accusedMemberId);
                      return (
                        <option key={report.id} value={report.id}>
                          {accused?.name ?? "不明"} / {verdictLabel[report.verdict]} / {report.content.slice(0, 18)}
                        </option>
                      );
                    })}
                  </select>
                </Field>
                {selectedReport && <ReportDetail report={selectedReport} members={state.members} />}
                <Field>
                  判決理由
                  <textarea className={inputClass} value={verdictReason} onChange={(event) => setVerdictReason(event.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!selectedReportId}
                    onClick={() => judge("guilty")}
                    className="min-h-12 rounded-md bg-ember px-3 py-2 text-sm font-black text-white shadow-[0_10px_26px_rgba(255,43,147,0.28)] disabled:opacity-50"
                  >
                    Guilty!!
                  </button>
                  <button
                    type="button"
                    disabled={!selectedReportId}
                    onClick={() => judge("not_guilty")}
                    className="min-h-12 rounded-md bg-lagoon px-3 py-2 text-sm font-black text-ink shadow-[0_10px_26px_rgba(0,191,214,0.24)] disabled:opacity-50"
                  >
                    Not Guilty!!
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </Shell>
  );
}

function MoraleReportList({
  reports,
  members,
}: {
  reports: MoraleReport[];
  members: Array<{ id: string; name: string }>;
}) {
  return (
    <div className="grid gap-3">
      {reports.length === 0 && <Card>まだ告発はありません。</Card>}
      {reports.map((report) => <ReportDetail key={report.id} report={report} members={members} />)}
    </div>
  );
}

function ReportDetail({
  report,
  members,
}: {
  report: MoraleReport;
  members: Array<{ id: string; name: string }>;
}) {
  const accused = members.find((member) => member.id === report.accusedMemberId);
  const accuser = members.find((member) => member.id === report.accuserMemberId);
  const verdictClass =
    report.verdict === "guilty"
      ? "bg-ember text-white"
      : report.verdict === "not_guilty"
        ? "bg-lagoon text-ink"
        : "bg-white text-reef";

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-slate-400">告発対象</p>
          <h3 className="text-xl font-black text-ink">{accused?.name ?? "不明"}</h3>
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-black ${verdictClass}`}>{verdictLabel[report.verdict]}</span>
      </div>
      <p className="mt-3 rounded-md bg-white/80 p-3 text-sm leading-6 text-slate-300">{report.content}</p>
      <p className="mt-2 text-xs text-slate-400">告発者: {accuser?.name ?? "匿名"} / {new Date(report.createdAt).toLocaleString("ja-JP", { hour: "2-digit", minute: "2-digit" })}</p>
      {report.verdictReason && <p className="mt-2 text-sm font-bold text-reef">判決理由: {report.verdictReason}</p>}
    </Card>
  );
}
