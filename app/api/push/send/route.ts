import { NextResponse } from "next/server";
import webPush from "web-push";
import type { PushSubscriptionRecord } from "@/lib/types";

export const runtime = "nodejs";

type PushRequest = {
  title?: string;
  body?: string;
  url?: string;
  subscriptions?: PushSubscriptionRecord[];
};

export async function POST(request: Request) {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

  if (!publicKey || !privateKey) {
    return NextResponse.json({ ok: false, error: "VAPID keys are not configured." }, { status: 500 });
  }

  const payload = (await request.json()) as PushRequest;
  const subscriptions = dedupeSubscriptions(payload.subscriptions ?? []);
  if (subscriptions.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  webPush.setVapidDetails(subject, publicKey, privateKey);
  const notificationPayload = JSON.stringify({
    title: payload.title || "僕らのサマーウォーズ ver-B",
    body: payload.body || "新しい通知があります。",
    url: payload.url || "/",
  });

  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webPush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        },
        notificationPayload,
      ),
    ),
  );

  return NextResponse.json({
    ok: true,
    sent: results.filter((result) => result.status === "fulfilled").length,
    failed: results.filter((result) => result.status === "rejected").length,
  });
}

function dedupeSubscriptions(subscriptions: PushSubscriptionRecord[]): PushSubscriptionRecord[] {
  const byEndpoint = new Map<string, PushSubscriptionRecord>();
  subscriptions.forEach((subscription) => {
    if (subscription.endpoint && subscription.keys?.auth && subscription.keys?.p256dh) {
      byEndpoint.set(subscription.endpoint, subscription);
    }
  });
  return Array.from(byEndpoint.values());
}
