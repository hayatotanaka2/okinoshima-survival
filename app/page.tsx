"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/Cards";
import { EventLogList, NotificationList } from "@/components/Lists";
import { PlayerSelector } from "@/components/PlayerSelector";
import { Shell } from "@/components/Shell";
import { getPushSubscription, isPushSupported, registerServiceWorker, subscribeToPushNotifications, upsertPushSubscription } from "@/lib/push";
import { useGameState } from "@/lib/useGameState";
import { useSelectedMember } from "@/lib/useSelectedMember";

const quickLinks = [
  ["/members", "メンバー"],
  ["/teams", "チーム"],
  ["/missions", "ミッション"],
  ["/items", "物資"],
  ["/auction", "オークション"],
  ["/morale", "士気掲示板"],
  ["/submissions", "写真投稿"],
  ["/admin", "管理者"],
];

export default function HomePage() {
  const { state, updateState } = useGameState();
  const { selectedMember } = useSelectedMember(state);

  if (!state) return <Shell title="僕らのサマーウォーズ ver-B"><p>読み込み中...</p></Shell>;

  return (
    <Shell>
      <div className="grid gap-4">
        <section className="relative overflow-hidden rounded-md border border-reef/15 bg-white/90 p-5 shadow-glow backdrop-blur-sm">
          <div className="absolute -right-5 -top-8 h-28 w-28 rounded-full border-[12px] border-lagoon/35 border-b-ember/40 border-l-lime/50" />
          <div className="absolute right-12 top-20 h-3 w-3 rounded-full bg-sun" />
          <p className="relative text-sm font-black text-reef">SYNC TRIP EVENT</p>
          <h2 className="relative mt-1 text-3xl font-black tracking-normal text-ink">僕らのサマーウォーズ ver-B</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            ミッション、物資、沖コイン、オークションで旅行を丸ごとゲーム化します。
          </p>
        </section>

        <Card>
          <h3 className="mb-3 text-lg font-black">最新通知</h3>
          <NotificationList notifications={state.notifications} limit={3} />
        </Card>

        {!selectedMember && <PlayerSelector state={state} />}

        <div className="grid grid-cols-2 gap-2">
          {quickLinks.map(([href, label]) => (
            <Link key={href} href={href} className="min-h-12 rounded-md border border-reef/10 bg-white/90 px-3 py-3 text-center text-sm font-black text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-lagoon/50 hover:bg-cyan-50">
              {label}
            </Link>
          ))}
        </div>

        <Card>
          <h3 className="mb-3 text-lg font-black">イベントログ</h3>
          <EventLogList logs={state.eventLogs} />
        </Card>

        <PwaNotice selectedMemberId={selectedMember?.id} updateState={updateState} />
      </div>
    </Shell>
  );
}

function PwaNotice({
  selectedMemberId,
  updateState,
}: {
  selectedMemberId?: string;
  updateState: ReturnType<typeof useGameState>["updateState"];
}) {
  const [message, setMessage] = useState("ミッション通知と告発通知は、Push通知を許可すると閉じていても届きます。");

  async function requestPermission() {
    await registerServiceWorker();
    if (!isPushSupported()) {
      setMessage("このブラウザではPush通知の一部機能が未対応です。MVPではアプリ内通知を使えます。");
      return;
    }
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      setMessage("Push通知用の公開キーが未設定です。Vercelと.env.localにNEXT_PUBLIC_VAPID_PUBLIC_KEYを設定してください。");
      return;
    }

    const subscription = (await getPushSubscription()) ?? (await subscribeToPushNotifications(publicKey));
    if (!subscription) {
      setMessage("通知が許可されませんでした。ホーム画面に追加したPWAから許可すると安定します。");
      return;
    }

    updateState((current) => upsertPushSubscription(current, subscription, selectedMemberId));
    setMessage("Push通知を登録しました。ミッション通知と告発通知が閉じていても届きます。");
  }

  return (
    <Card>
      <h3 className="text-lg font-black">PWA / 通知</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        iPhoneではSafariで開き、共有から「ホーム画面に追加」したあと、ホーム画面のアイコンから起動してください。
      </p>
      <button onClick={requestPermission} className="mt-3 min-h-11 rounded-md bg-ember px-4 py-2 text-sm font-black text-white shadow-[0_8px_22px_rgba(255,43,147,0.2)]">
        通知を許可する
      </button>
      <p className="mt-2 text-xs text-slate-400">{message}</p>
    </Card>
  );
}
