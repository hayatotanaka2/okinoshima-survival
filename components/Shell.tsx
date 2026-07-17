"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "ホーム", icon: "⌂" },
  { href: "/teams", label: "チーム", icon: "◆" },
  { href: "/missions", label: "任務", icon: "!" },
  { href: "/items", label: "物資", icon: "□" },
  { href: "/submissions", label: "写真", icon: "▣" },
  { href: "/admin", label: "管理", icon: "⚙" },
];

export function Shell({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="mx-auto min-h-screen max-w-md safe-bottom">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-midnight/88 px-4 py-3 backdrop-blur">
        <p className="text-xs font-semibold text-lagoon">OKINOSHIMA SURVIVAL</p>
        <h1 className="text-xl font-black tracking-normal">{title ?? "沖ノ島サバイバル"}</h1>
      </header>
      <main className="px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}

function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-slate-950/92 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-6 gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center rounded-md text-xs font-bold ${
                active ? "bg-lagoon text-slate-950" : "text-slate-300"
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
