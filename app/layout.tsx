import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { EmergencyMissionAlert } from "@/components/EmergencyMissionAlert";
import "./globals.css";

export const metadata: Metadata = {
  title: "沖ノ島サバイバル",
  description: "同期旅行で使う沖ノ島サバイバルゲームPWA",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "沖サバ",
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
        {children}
        <EmergencyMissionAlert />
      </body>
    </html>
  );
}
