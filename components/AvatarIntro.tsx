"use client";

import { useEffect, useState } from "react";
import { avatarAssets } from "@/lib/avatarAssets";

const INTRO_KEY = "okinoshima-avatar-intro-shown-at";
const INTRO_INTERVAL_MS = 12 * 60 * 60 * 1000;
const INTRO_DURATION_MS = 3400;

export function AvatarIntro() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lastShown = Number(window.localStorage.getItem(INTRO_KEY) ?? 0);
    if (Date.now() - lastShown < INTRO_INTERVAL_MS) return;

    setVisible(true);
    window.localStorage.setItem(INTRO_KEY, String(Date.now()));
    const timer = window.setTimeout(() => setVisible(false), INTRO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const featured = avatarAssets.slice(0, 12);

  return (
    <div className="avatar-intro fixed inset-0 z-[70] grid place-items-center overflow-hidden bg-white/95 px-4" role="dialog" aria-modal="true" aria-label="沖ノ島サバイバル起動">
      <div className="avatar-intro-grid absolute inset-0 opacity-70" />
      <div className="absolute inset-x-0 top-[16%] flex justify-center text-[10px] font-black tracking-[0.45em] text-reef">
        OKINOSHIMA SURVIVAL
      </div>
      <section className="avatar-intro-core relative z-10 w-full max-w-sm text-center">
        <div className="relative mx-auto grid h-52 w-52 place-items-center">
          <div className="absolute h-52 w-52 rounded-full border border-lagoon/25" />
          <div className="absolute h-40 w-40 rounded-full border border-ember/25" />
          <div className="absolute h-24 w-24 rounded-full border border-reef/25" />
          {featured.map((avatar, index) => {
            const angle = (360 / featured.length) * index;
            return (
              <img
                key={avatar.name}
                src={avatar.src}
                alt=""
                className="avatar-intro-face absolute h-12 w-12 rounded-full border-2 border-white object-cover shadow-[0_12px_30px_rgba(67,54,130,0.22)]"
                style={{
                  transform: `rotate(${angle}deg) translateY(-86px) rotate(-${angle}deg)`,
                  animationDelay: `${index * 0.06}s`,
                }}
              />
            );
          })}
          <div className="avatar-intro-badge grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-lagoon via-white to-ember p-1 shadow-[0_18px_45px_rgba(0,191,214,0.24)]">
            <div className="grid h-full w-full place-items-center rounded-full bg-white text-center">
              <div>
                <p className="text-xs font-black text-reef">SYNC</p>
                <p className="text-xl font-black text-ink">沖サバ</p>
              </div>
            </div>
          </div>
        </div>
        <h2 className="mt-4 text-3xl font-black text-ink">メンバー接続中</h2>
        <p className="mt-2 text-sm font-bold text-slate-300">沖ノ島サバイバルを起動しています</p>
        <button className="mt-5 min-h-11 rounded-md bg-ember px-6 py-2 text-sm font-black text-white shadow-[0_12px_30px_rgba(255,43,147,0.25)]" onClick={() => setVisible(false)}>
          はじめる
        </button>
      </section>
    </div>
  );
}
