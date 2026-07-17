"use client";

import { FormEvent, useEffect, useState } from "react";
import { Card, Field, PrimaryButton, inputClass } from "@/components/Cards";
import { Shell } from "@/components/Shell";
import { createMissionSubmission } from "@/lib/missionLogic";
import { uploadMissionPhoto } from "@/lib/photoStorage";
import { useGameState } from "@/lib/useGameState";
import { useSelectedMember } from "@/lib/useSelectedMember";

export default function SubmissionsPage() {
  const { state, updateState } = useGameState();
  const [missionId, setMissionId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const { selectedMemberId, selectedMember, setSelectedMemberId } = useSelectedMember(state);

  useEffect(() => {
    if (selectedMemberId && !memberId) setMemberId(selectedMemberId);
    if (selectedMember?.currentTeamId && !teamId) setTeamId(selectedMember.currentTeamId);
  }, [memberId, selectedMember, selectedMemberId, teamId]);

  if (!state) return <Shell title="写真投稿"><p>読み込み中...</p></Shell>;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!missionId || !teamId || !memberId || !file) return;
    setUploading(true);
    setMessage("");
    try {
      const imageUrl = await uploadMissionPhoto(file);
      updateState((current) =>
        createMissionSubmission(current, {
          missionId,
          teamId,
          submittedByMemberId: memberId,
          imageUrl,
          comment,
        }),
      );
      setComment("");
      setFile(null);
      setMessage("投稿しました。幹事の承認を待ってください。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "投稿に失敗しました。");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Shell title="写真投稿">
      <div className="grid gap-4">
        <Card>
          <form className="grid gap-3" onSubmit={submit}>
            <Field>
              ミッション
              <select className={inputClass} value={missionId} onChange={(event) => setMissionId(event.target.value)}>
                <option value="">選択してください</option>
                {state.missions.map((mission) => (
                  <option key={mission.id} value={mission.id}>{mission.title}</option>
                ))}
              </select>
            </Field>
            <Field>
              チーム
              <select className={inputClass} value={teamId} onChange={(event) => setTeamId(event.target.value)}>
                <option value="">選択してください</option>
                {state.teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </Field>
            <Field>
              投稿者
              <select
                className={inputClass}
                value={memberId}
                onChange={(event) => {
                  const nextMemberId = event.target.value;
                  const nextMember = state.members.find((member) => member.id === nextMemberId);
                  setMemberId(nextMemberId);
                  setSelectedMemberId(nextMemberId);
                  if (nextMember?.currentTeamId) setTeamId(nextMember.currentTeamId);
                }}
              >
                <option value="">選択してください</option>
                {state.members.map((member) => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </Field>
            <Field>
              写真
              <input
                className={inputClass}
                type="file"
                accept="image/*"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </Field>
            <Field>
              コメント
              <textarea className={inputClass} value={comment} onChange={(event) => setComment(event.target.value)} />
            </Field>
            <PrimaryButton type="submit" disabled={!missionId || !teamId || !memberId || !file || uploading}>
              {uploading ? "投稿中..." : "写真を投稿する"}
            </PrimaryButton>
            {message && <p className="text-sm text-lagoon">{message}</p>}
          </form>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-black">投稿一覧</h2>
          <div className="grid gap-3">
            {state.submissions.length === 0 && <p className="text-sm text-slate-400">まだ投稿がありません。</p>}
            {state.submissions.map((submission) => {
              const mission = state.missions.find((candidate) => candidate.id === submission.missionId);
              const team = state.teams.find((candidate) => candidate.id === submission.teamId);
              return (
                <div key={submission.id} className="rounded-md bg-slate-950/50 p-3">
                  <img src={submission.imageUrl} alt="" className="mb-3 aspect-video w-full rounded-md object-cover" />
                  <p className="font-black">{mission?.title ?? "ミッション"}</p>
                  <p className="text-sm text-slate-400">{team?.name ?? "チーム"} / {submission.status}</p>
                  {submission.comment && <p className="mt-2 text-sm text-slate-300">{submission.comment}</p>}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
