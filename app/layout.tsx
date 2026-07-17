import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AvatarAtmosphere } from "@/components/AvatarAtmosphere";
import { AvatarIntro } from "@/components/AvatarIntro";
import { EmergencyMissionAlert } from "@/components/EmergencyMissionAlert";
import { JudgmentAlert } from "@/components/JudgmentAlert";
import "./globals.css";

export const metadata: Metadata = {
  title: "僕らのサマーウォーズ ver-B",
  description: "同期旅行で使うイベントPWA",
  manifest: "/manifest.json",
  icons: {
    icon: "/clock.jpeg",
    apple: "/clock.jpeg",
  },
  appleWebApp: {
    capable: true,
    title: "僕らのサマーウォーズ ver-B",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <AvatarAtmosphere />
        {children}
        <AvatarIntro />
        <EmergencyMissionAlert />
        <JudgmentAlert />
      </body>
    </html>
  );
}
