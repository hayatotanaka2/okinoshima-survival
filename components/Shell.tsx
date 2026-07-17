"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { HeaderPlayerButton } from "./HeaderPlayerButton";

const navItems = [
  { href: "/", label: "ホーム", icon: "⌂" },
  { href: "/teams", label: "チーム", icon: "◆" },
  { href: "/missions", label: "任務", icon: "!" },
  { href: "/items", label: "物資", icon: "□" },
  { href: "/morale", label: "士気", icon: "§" },
];

export function Shell({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-white/35 safe-bottom md:border-x md:border-reef/10">
      <header className="sticky top-0 z-20 border-b border-reef/10 bg-white/88 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-lagoon via-lime to-sun text-sm font-black text-ink shadow-sm">O</span>
          <div>
            <p className="text-xs font-black text-reef">OKINOSHIMA SURVIVAL</p>
            <h1 className="text-xl font-black tracking-normal text-ink">{title ?? "沖ノ島サバイバル"}</h1>
          </div>
          <HeaderPlayerButton />
        </div>
      </header>
      <main className="px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-reef/10 bg-white/92 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-10px_34px_rgba(67,54,130,0.08)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center rounded-md text-xs font-bold transition ${
                active ? "bg-reef text-white shadow-sm" : "text-slate-400 hover:bg-cyan-50 hover:text-ink"
              }`}
            >
              <span className="text-lg leading-5">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
