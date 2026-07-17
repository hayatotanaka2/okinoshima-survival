"use client";

import { FormEvent, useState } from "react";
import { Card, Field, PrimaryButton, inputClass } from "@/components/Cards";
import { Shell } from "@/components/Shell";
import { claimMissionTreasureCode, createMissionSubmission, isMissionCompletedByTeam } from "@/lib/missionLogic";
import { uploadMissionPhotos } from "@/lib/photoStorage";
import { useGameState } from "@/lib/useGameState";
import { useSelectedMember } from "@/lib/useSelectedMember";
import type { Mission } from "@/lib/types";

const statusLabel = {
  draft: "未発動",
  active: "発動中",
  completed: "発動中",
  closed: "終了",
};

const categoryLabel: Record<NonNullable<Mission["category"]>, string> = {
  "permanent-1": "常設1",
  "permanent-2": "常設2",
  "emergency-treasure": "緊急宝探し",
  "emergency-battle": "緊急バトル",
  single: "単発",
};

export default function MissionsPage() {
  const { state, updateState } = useGameState();
  const { selectedMember } = useSelectedMember(state);
  const [filesByMission, setFilesByMission] = useState<Record<string, File[]>>({});
  const [commentsByMission, setCommentsByMission] = useState<Record<string, string>>({});
  const [codesByMission, setCodesByMission] = useState<Record<string, string>>({});
  const [messageByMission, setMessageByMission] = useState<Record<string, string>>({});
  const [uploadingMissionId, setUploadingMissionId] = useState("");

  if (!state) return <Shell title="ミッション"><p>読み込み中...</p></Shell>;

  const currentTeam = state.teams.find((team) => team.id === selectedMember?.currentTeamId);

  async function submitPhotos(event: FormEvent, mission: Mission) {
    event.preventDefault();
    if (!selectedMember || !currentTeam) return;
    const files = filesByMission[mission.id] ?? [];
    if (files.length === 0) return;
    setUploadingMissionId(mission.id);
    setMessageByMission((current) => ({ ...current, [mission.id]: "" }));
    try {
      const imageUrls = await uploadMissionPhotos(files);
      updateState((current) =>
        createMissionSubmission(current, {
          missionId: mission.id,
          teamId: currentTeam.id,
          submittedByMemberId: selectedMember.id,
          imageUrl: imageUrls[0] ?? "",
          imageUrls,
          comment: commentsByMission[mission.id] ?? "",
        }),
      );
      setFilesByMission((current) => ({ ...current, [mission.id]: [] }));
      setCommentsByMission((current) => ({ ...current, [mission.id]: "" }));
      setMessageByMission((current) => ({ ...current, [mission.id]: "投稿しました。幹事の承認を待ってください。" }));
    } catch (error) {
      setMessageByMission((current) => ({
        ...current,
        [mission.id]: error instanceof Error ? error.message : "投稿に失敗しました。",
      }));
    } finally {
      setUploadingMissionId("");
    }
  }

  function submitCode(mission: Mission) {
    if (!selectedMember || !currentTeam) return;
    updateState((current) => claimMissionTreasureCode(current, mission.id, currentTeam.id, selectedMember.id, codesByMission[mission.id] ?? ""));
    setCodesByMission((current) => ({ ...current, [mission.id]: "" }));
  }

  return (
    <Shell title="ミッション">
      <div className="grid gap-3">
        {state.missions.map((mission) => {
          const completedTeams = state.teams.filter((team) => isMissionCompletedByTeam(mission, team));
          const completedByMyTeam = isMissionCompletedByTeam(mission, currentTeam);
          const canAct = mission.status === "active" && currentTeam && selectedMember && !completedByMyTeam;
          const requiresPhoto = mission.requiresPhoto ?? true;
          const requiresCode = mission.requiresCode ?? false;
          return (
            <Card key={mission.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  {mission.isEmergency && <p className="mb-1 text-xs font-black text-ember">緊急ミッション</p>}
                  <h2 className="text-lg font-black">{mission.title}</h2>
                </div>
                <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-black ${mission.status === "active" ? "bg-ember text-white" : "bg-lagoon text-ink"}`}>
                  {statusLabel[mission.status]}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-black">
                <span className="rounded-md bg-cyan-50 px-2 py-1 text-ink">{categoryLabel[mission.category ?? "single"]}</span>
                <span className="rounded-md bg-violet-50 px-2 py-1 text-reef">{mission.requirement === "required" ? "必須" : "任意"}</span>
                <span className="rounded-md bg-yellow-50 px-2 py-1 text-ink">{(mission.rewardKind ?? "coin") === "item" ? mission.rewardItem?.name ?? "カード報酬" : `${mission.rewardCoin}沖`}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{mission.description}</p>
              <div className="mt-3 grid gap-2 text-center text-sm">
                <p className={`rounded-md p-2 font-black ${completedByMyTeam ? "bg-lime text-ink" : "bg-white text-ember"}`}>
                  {currentTeam ? (completedByMyTeam ? "あなたのチームは達成済み" : "あなたのチームは未達成") : "自分を選択してください"}
                </p>
              </div>
              {canAct && requiresPhoto && (
                <form className="mt-4 grid gap-2 rounded-md border border-reef/15 bg-white/70 p-3" onSubmit={(event) => submitPhotos(event, mission)}>
                  <Field>
                    写真
                    <input
                      className={inputClass}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) => setFilesByMission((current) => ({ ...current, [mission.id]: Array.from(event.target.files ?? []) }))}
                    />
                  </Field>
                  <Field>
                    コメント
                    <textarea
                      className={inputClass}
                      value={commentsByMission[mission.id] ?? ""}
                      onChange={(event) => setCommentsByMission((current) => ({ ...current, [mission.id]: event.target.value }))}
                    />
                  </Field>
                  <PrimaryButton type="submit" disabled={(filesByMission[mission.id] ?? []).length === 0 || uploadingMissionId === mission.id}>
                    {uploadingMissionId === mission.id ? "投稿中..." : "写真を投稿する"}
                  </PrimaryButton>
                </form>
              )}
              {canAct && requiresCode && (
                <div className="mt-4 grid gap-2 rounded-md border border-reef/15 bg-white/70 p-3">
                  <Field>
                    コード
                    <input
                      className={inputClass}
                      value={codesByMission[mission.id] ?? ""}
                      onChange={(event) => setCodesByMission((current) => ({ ...current, [mission.id]: event.target.value }))}
                      placeholder="OKI-001"
                    />
                  </Field>
                  <PrimaryButton disabled={!codesByMission[mission.id]} onClick={() => submitCode(mission)}>報酬を受け取る</PrimaryButton>
                </div>
              )}
              {messageByMission[mission.id] && <p className="mt-2 text-sm font-bold text-lagoon">{messageByMission[mission.id]}</p>}
              <p className="mt-3 text-sm text-slate-400">
                達成チーム: {completedTeams.map((team) => team.name).join("、") || "なし"}
              </p>
            </Card>
          );
        })}
      </div>
    </Shell>
  );
}
