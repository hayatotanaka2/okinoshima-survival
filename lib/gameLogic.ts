import type { AppNotification, EventLog, EventLogType, GameState, NotificationType } from "./types";

export function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function addEventLog(
  state: GameState,
  message: string,
  type: EventLogType = "system",
): GameState {
  const log: EventLog = {
    id: uid("log"),
    message,
    type,
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    eventLogs: [log, ...state.eventLogs].slice(0, 100),
  };
}

export function addNotification(
  state: GameState,
  title: string,
  body: string,
  type: NotificationType = "system",
): GameState {
  const notification: AppNotification = {
    id: uid("notice"),
    title,
    body,
    type,
    readByMemberIds: [],
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    notifications: [notification, ...state.notifications].slice(0, 50),
  };
}

export function withAnnouncement(
  state: GameState,
  message: string,
  logType: EventLogType,
  title: string,
  notificationType: NotificationType,
): GameState {
  return addNotification(addEventLog(state, message, logType), title, message, notificationType);
}
