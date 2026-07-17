"use client";

import type { AppNotification, GameState, PushSubscriptionRecord } from "./types";

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "Notification" in window &&
    "PushManager" in window
  );
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  return window.Notification.requestPermission();
}

export function showLocalNotification(title: string, options?: NotificationOptions): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (window.Notification.permission === "granted") {
    new window.Notification(title, options);
  }
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const registration = await registerServiceWorker();
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

export async function subscribeToPushNotifications(publicVapidKey: string): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const registration = await registerServiceWorker();
  if (!registration) return null;

  const permission = await requestNotificationPermission();
  if (permission !== "granted") return null;

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToArrayBuffer(publicVapidKey),
  });
}

export function upsertPushSubscription(
  state: GameState,
  subscription: PushSubscription,
  memberId?: string,
): GameState {
  const record = toPushSubscriptionRecord(subscription, memberId);
  const existing = state.pushSubscriptions.find((candidate) => candidate.endpoint === record.endpoint);
  const pushSubscriptions = existing
    ? state.pushSubscriptions.map((candidate) =>
        candidate.endpoint === record.endpoint
          ? {
              ...candidate,
              keys: record.keys,
              memberId: record.memberId ?? candidate.memberId,
              userAgent: record.userAgent,
              updatedAt: record.updatedAt,
            }
          : candidate,
      )
    : [record, ...state.pushSubscriptions];

  return { ...state, pushSubscriptions };
}

export async function sendNewImportantPushNotifications(previous: GameState, next: GameState): Promise<void> {
  if (typeof window === "undefined") return;
  const previousIds = new Set(previous.notifications.map((notification) => notification.id));
  const targets = next.notifications.filter(
    (notification) =>
      !previousIds.has(notification.id) &&
      (notification.type === "mission" || notification.type === "morale"),
  );
  if (targets.length === 0 || next.pushSubscriptions.length === 0) return;

  await Promise.all(targets.map((notification) => sendPushNotification(notification, next.pushSubscriptions)));
}

async function sendPushNotification(notification: AppNotification, subscriptions: PushSubscriptionRecord[]): Promise<void> {
  try {
    await fetch("/api/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: notification.title,
        body: notification.body,
        type: notification.type,
        url: notification.type === "morale" ? "/morale" : "/missions",
        subscriptions,
      }),
    });
  } catch {
    // Pushは補助通知なので、失敗してもゲーム操作自体は止めない。
  }
}

function toPushSubscriptionRecord(subscription: PushSubscription, memberId?: string): PushSubscriptionRecord {
  const json = subscription.toJSON();
  const now = new Date().toISOString();
  return {
    endpoint: json.endpoint ?? subscription.endpoint,
    keys: {
      p256dh: json.keys?.p256dh ?? "",
      auth: json.keys?.auth ?? "",
    },
    memberId,
    userAgent: typeof navigator === "undefined" ? undefined : navigator.userAgent,
    createdAt: now,
    updatedAt: now,
  };
}

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0))).buffer;
}
