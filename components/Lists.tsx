import { calculateTeamCoin } from "@/lib/teamLogic";
import type { AppNotification, EventLog, GameState, Team } from "@/lib/types";
import { Card } from "./Cards";

export function TeamRow({ team, state }: { team: Team; state: GameState }) {
  return (
    <div className="rounded-md border border-reef/10 bg-slate-950/45 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm" style={{ background: team.color }} />
          <p className="font-black">{team.name}</p>
        </div>
        <p className="text-sm font-bold text-lagoon">{calculateTeamCoin(team, state.members)}沖</p>
      </div>
      <p className="mt-1 text-xs text-slate-400">
        {team.memberIds.length}人
      </p>
    </div>
  );
}

export function EventLogList({ logs }: { logs: EventLog[] }) {
  return (
    <div className="grid max-h-80 gap-2 overflow-y-auto pr-1">
      {logs.slice(0, 80).map((log) => (
        <p key={log.id} className="rounded-md bg-slate-950/45 p-3 text-sm text-slate-200">
          <span className="mr-2 text-xs font-bold text-lagoon">{new Date(log.createdAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}</span>
          {log.message}
        </p>
      ))}
      {logs.length === 0 && <p className="text-sm text-slate-400">まだログがありません。</p>}
    </div>
  );
}

export function NotificationList({ notifications, limit = 4 }: { notifications: AppNotification[]; limit?: number }) {
  return (
    <div className="grid gap-2">
      {notifications.slice(0, limit).map((notice) => {
        const isEmergency = notice.type === "mission" && (notice.title.includes("緊急") || notice.body.includes("緊急"));
        return (
        <Card key={notice.id} className={`p-3 ${isEmergency ? "border-ember bg-ember text-white shadow-[0_12px_28px_rgba(255,43,147,0.26)]" : ""}`}>
          <p className={`text-sm font-black ${isEmergency ? "text-white" : "text-ember"}`}>{notice.title}</p>
          <p className={`mt-1 text-sm ${isEmergency ? "text-white" : "text-slate-200"}`}>{notice.body}</p>
        </Card>
        );
      })}
    </div>
  );
}
