"use client";

import Link from "next/link";
import { Card } from "@/components/Cards";
import { Shell } from "@/components/Shell";

export default function ComposePage() {
  return (
    <Shell title="チーム編成">
      <Card>
        <h2 className="text-lg font-black text-ink">チーム編成は管理者画面で行います</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          参加者側から誤ってチームを変更しないよう、この画面では編成操作をできません。
        </p>
        <Link
          href="/admin"
          className="mt-4 block rounded-md bg-lagoon px-4 py-3 text-center text-sm font-black text-ink shadow-[0_8px_22px_rgba(0,191,214,0.18)]"
        >
          管理者画面へ
        </Link>
      </Card>
    </Shell>
  );
}
