"use client";

import { FormEvent, useState } from "react";
import type { ReactNode } from "react";
import { Card, Field, PrimaryButton, inputClass } from "@/components/Cards";
import { EventLogList } from "@/components/Lists";
import { Shell } from "@/components/Shell";
import { settleAuctionItem } from "@/lib/auctionLogic";
import { addCoinToMember, subtractCoinFromMember } from "@/lib/coinLogic";
import { addEventLog, addNotification, uid } from "@/lib/gameLogic";
import { assignItemToMember } from "@/lib/itemLogic";
import { deleteMember, updateMemberName } from "@/lib/memberLogic";
import { applyRankingRewards, approveMissionSubmission, completeMissionForTeam, createMission, deleteMission, rejectMissionSubmission, setMissionStatus, updateMission } from "@/lib/missionLogic";
import { addTeam, applyTeamDraft, buildRandomTeams, calculateTeamCoin, deleteTeam, moveMemberToTeam, updateTeam } from "@/lib/teamLogic";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { useGameState } from "@/lib/useGameState";
import type { GameState, MissionCategory, MissionDifficulty, MissionRequirement, MissionRewardKind, MissionRewardMode, MissionTargetType, Team, Treasure } from "@/lib/types";

export default function AdminPage() {
  const { state, updateState, reset } = useGameState();
  const [passcode, setPasscode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [teamCount, setTeamCount] = useState(4);
  const [spreadOrganizers, setSpreadOrganizers] = useState(true);
  const [draftTeams, setDraftTeams] = useState<Team[]>([]);
  const [memberName, setMemberName] = useState("");
  const [editMemberId, setEditMemberId] = useState("");
  const [editMemberName, setEditMemberName] = useState("");
  const [moveMemberId, setMoveMemberId] = useState("");
  const [moveTeamId, setMoveTeamId] = useState("");
  const [coinMemberId, setCoinMemberId] = useState("");
  const [coinAmount, setCoinAmount] = useState(100);
  const [missionId, setMissionId] = useState("");
  const [missionTeamId, setMissionTeamId] = useState("");
  const [missionTitle, setMissionTitle] = useState("");
  const [missionDescription, setMissionDescription] = useState("");
  const [missionRewardCoin, setMissionRewardCoin] = useState(500);
  const [missionDifficulty, setMissionDifficulty] = useState<MissionDifficulty>("normal");
  const [missionTargetType, setMissionTargetType] = useState<MissionTargetType>("team");
  const [missionCategory, setMissionCategory] = useState<MissionCategory>("single");
  const [missionRequirement, setMissionRequirement] = useState<MissionRequirement>("optional");
  const [missionRequiresPhoto, setMissionRequiresPhoto] = useState(true);
  const [missionRequiresCode, setMissionRequiresCode] = useState(false);
  const [missionTreasureCode, setMissionTreasureCode] = useState("");
  const [missionRewardKind, setMissionRewardKind] = useState<MissionRewardKind>("coin");
  const [missionRewardMode, setMissionRewardMode] = useState<MissionRewardMode>("same");
  const [missionRewardItemName, setMissionRewardItemName] = useState("");
  const [missionRewardItemDescription, setMissionRewardItemDescription] = useState("");
  const [rankingRewards, setRankingRewards] = useState([
    { rank: 1, rewardKind: "coin" as MissionRewardKind, rewardCoin: 1000, rewardItemName: "", rewardItemDescription: "" },
    { rank: 2, rewardKind: "coin" as MissionRewardKind, rewardCoin: 600, rewardItemName: "", rewardItemDescription: "" },
    { rank: 3, rewardKind: "coin" as MissionRewardKind, rewardCoin: 300, rewardItemName: "", rewardItemDescription: "" },
  ]);
  const [editMissionId, setEditMissionId] = useState("");
  const [rankingMissionId, setRankingMissionId] = useState("");
  const [rankingTeamIds, setRankingTeamIds] = useState(["", "", ""]);
  const [teamName, setTeamName] = useState("");
  const [teamColor, setTeamColor] = useState("#00bfd6");
  const [editTeamId, setEditTeamId] = useState("");
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamColor, setEditTeamColor] = useState("#00bfd6");
  const [itemId, setItemId] = useState("");
  const [itemOwnerId, setItemOwnerId] = useState("");
  const [auctionId, setAuctionId] = useState("");
  const [auctionTeamId, setAuctionTeamId] = useState("");
  const [auctionWinnerMemberId, setAuctionWinnerMemberId] = useState("");
  const [auctionPrice, setAuctionPrice] = useState(500);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeBody, setNoticeBody] = useState("");
  const [treasureCode, setTreasureCode] = useState("");
  const [treasureTitle, setTreasureTitle] = useState("");
  const [treasureCoin, setTreasureCoin] = useState(300);

  if (!state) return <Shell title="管理者"><p>読み込み中...</p></Shell>;

  if (!authed) {
    return (
      <Shell title="管理者">
        <Card>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              setAuthed(passcode === "admin123");
            }}
          >
            <Field>
              管理者パスコード
              <input className={inputClass} type="password" value={passcode} onChange={(event) => setPasscode(event.target.value)} />
            </Field>
            <PrimaryButton type="submit">入室する</PrimaryButton>
          </form>
        </Card>
      </Shell>
    );
  }

  function addMember(event: FormEvent) {
    event.preventDefault();
    if (!memberName.trim()) return;
    updateState((current) =>
      addEventLog(
        {
          ...current,
          members: [
            ...current.members,
            {
              id: uid("member"),
              name: memberName.trim(),
              coin: 500,
              totalEarnedCoin: 500,
              totalSpentCoin: 0,
              itemIds: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        },
        `${memberName.trim()}を追加しました。`,
        "system",
      ),
    );
    setMemberName("");
  }

  function submitMemberEdit(event: FormEvent) {
    event.preventDefault();
    if (!editMemberId || !editMemberName.trim()) return;
    updateState((current) => updateMemberName(current, editMemberId, editMemberName));
    setEditMemberName("");
  }

  function submitTeamCreate(event: FormEvent) {
    event.preventDefault();
    if (!teamName.trim()) return;
    updateState((current) => addTeam(current, teamName, teamColor));
    setTeamName("");
  }

  function submitTeamEdit(event: FormEvent) {
    event.preventDefault();
    if (!editTeamId || !editTeamName.trim()) return;
    updateState((current) => updateTeam(current, editTeamId, editTeamName, editTeamColor));
  }

  function submitMissionCreate(event: FormEvent) {
    event.preventDefault();
    if (!missionTitle.trim()) return;
    updateState((current) =>
      createMission(current, {
        title: missionTitle,
        description: missionDescription,
        rewardCoin: missionRewardCoin,
        difficulty: missionDifficulty,
        targetType: missionTargetType,
        category: missionCategory,
        requirement: missionRequirement,
        requiresPhoto: missionRequiresPhoto,
        requiresCode: missionRequiresCode || missionCategory === "emergency-treasure",
        treasureCode: missionTreasureCode,
        rewardKind: missionRewardKind,
        rewardMode: missionRewardMode,
        rewardItem: missionRewardKind === "item"
          ? {
              name: missionRewardItemName,
              description: missionRewardItemDescription,
              type: "privilege",
              value: 0,
            }
          : undefined,
        rankingRewards: rankingRewards.map((reward) => ({
          rank: reward.rank,
          rewardKind: reward.rewardKind,
          rewardCoin: reward.rewardCoin,
          rewardItem: reward.rewardKind === "item"
            ? {
                name: reward.rewardItemName,
                description: reward.rewardItemDescription,
                type: "privilege",
                value: 0,
              }
            : undefined,
        })),
      }),
    );
    setMissionTitle("");
    setMissionDescription("");
    setMissionTreasureCode("");
    setMissionRewardItemName("");
    setMissionRewardItemDescription("");
  }

  function submitMissionEdit(event: FormEvent) {
    event.preventDefault();
    if (!editMissionId || !missionTitle.trim()) return;
    updateState((current) =>
      updateMission(current, editMissionId, {
        title: missionTitle,
        description: missionDescription,
        rewardCoin: missionRewardCoin,
        difficulty: missionDifficulty,
        targetType: missionTargetType,
        category: missionCategory,
        requirement: missionRequirement,
        requiresPhoto: missionRequiresPhoto,
        requiresCode: missionRequiresCode || missionCategory === "emergency-treasure",
        treasureCode: missionTreasureCode,
        rewardKind: missionRewardKind,
        rewardMode: missionRewardMode,
        rewardItem: missionRewardKind === "item"
          ? {
              name: missionRewardItemName,
              description: missionRewardItemDescription,
              type: "privilege",
              value: 0,
            }
          : undefined,
        rankingRewards: rankingRewards.map((reward) => ({
          rank: reward.rank,
          rewardKind: reward.rewardKind,
          rewardCoin: reward.rewardCoin,
          rewardItem: reward.rewardKind === "item"
            ? {
                name: reward.rewardItemName,
                description: reward.rewardItemDescription,
                type: "privilege",
                value: 0,
              }
            : undefined,
        })),
      }),
    );
  }

  function createTreasure(event: FormEvent) {
    event.preventDefault();
    if (!treasureCode.trim() || !treasureTitle.trim()) return;
    const treasure: Treasure = {
      id: uid("treasure"),
      code: treasureCode.trim().toUpperCase(),
      title: treasureTitle.trim(),
      description: "管理者が追加した宝箱です。",
      rewardType: "coin",
      rewardCoin: treasureCoin,
      status: "hidden",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updateState((current) => addEventLog({ ...current, treasures: [...current.treasures, treasure] }, `宝箱「${treasure.title}」を追加しました。`, "treasure"));
    setTreasureCode("");
    setTreasureTitle("");
  }

  function createNotice(event: FormEvent) {
    event.preventDefault();
    if (!noticeTitle.trim() || !noticeBody.trim()) return;
    updateState((current) => addNotification(addEventLog(current, `通知「${noticeTitle}」を作成しました。`, "notification"), noticeTitle, noticeBody, "system"));
    setNoticeTitle("");
    setNoticeBody("");
  }

  function generateTeamDraft() {
    if (!state) return;
    setDraftTeams(buildRandomTeams(state.members, teamCount, spreadOrganizers));
  }

  function moveDraftMember(memberId: string, nextTeamId: string) {
    setDraftTeams((current) =>
      current.map((team) => ({
        ...team,
        memberIds:
          team.id === nextTeamId
            ? Array.from(new Set([...team.memberIds, memberId]))
            : team.memberIds.filter((id) => id !== memberId),
        updatedAt: new Date().toISOString(),
      })),
    );
  }

  function confirmTeamDraft() {
    if (draftTeams.length === 0) return;
    updateState((current) => applyTeamDraft(current, draftTeams));
    setDraftTeams([]);
  }

  return (
    <Shell title="管理者">
      <div className="grid gap-4">
        <AdminCard title="本番同期ステータス">
          <div className={`rounded-md p-3 text-sm font-bold ${isSupabaseConfigured() ? "bg-lagoon text-ink" : "bg-ember text-white"}`}>
            {isSupabaseConfigured() ? "Supabase環境変数は設定済みです。" : "Supabase環境変数が未設定です。現在はlocalStorage fallbackで動きます。"}
          </div>
          <p className="mt-2 text-sm text-slate-400">
            {isSupabaseConfigured()
              ? "全端末で同じゲーム状態を同期しています。"
              : "Vercel本番では NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。"}
          </p>
        </AdminCard>

        <AdminCard title="メンバー追加">
          <form className="grid gap-3" onSubmit={addMember}>
            <Field>
              名前
              <input className={inputClass} value={memberName} onChange={(event) => setMemberName(event.target.value)} />
            </Field>
            <PrimaryButton type="submit">追加する</PrimaryButton>
          </form>
        </AdminCard>

        <AdminCard title="メンバー編集・削除">
          <form className="grid gap-3" onSubmit={submitMemberEdit}>
            <SelectMember
              state={state}
              value={editMemberId}
              onChange={(value) => {
                setEditMemberId(value);
                setEditMemberName(state.members.find((member) => member.id === value)?.name ?? "");
              }}
            />
            <Field>
              新しい名前
              <input className={inputClass} value={editMemberName} onChange={(event) => setEditMemberName(event.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <PrimaryButton type="submit" disabled={!editMemberId || !editMemberName.trim()}>名前変更</PrimaryButton>
              <DangerButton disabled={!editMemberId} onClick={() => updateState((current) => deleteMember(current, editMemberId))}>削除</DangerButton>
            </div>
          </form>
        </AdminCard>

        <AdminCard title="コイン操作">
          <div className="grid gap-3">
            <SelectMember state={state} value={coinMemberId} onChange={setCoinMemberId} />
            <Field>
              金額
              <input className={inputClass} type="number" value={coinAmount} onChange={(event) => setCoinAmount(Number(event.target.value))} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <PrimaryButton disabled={!coinMemberId} onClick={() => updateState((current) => addCoinToMember(current, coinMemberId, coinAmount))}>加算</PrimaryButton>
              <PrimaryButton disabled={!coinMemberId} onClick={() => updateState((current) => subtractCoinFromMember(current, coinMemberId, coinAmount))}>減算</PrimaryButton>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="チーム再編成">
          <div className="grid gap-3">
            <Field>
              チーム数
              <input className={inputClass} type="number" min={2} max={6} value={teamCount} onChange={(event) => setTeamCount(Number(event.target.value))} />
            </Field>
            <label className="flex items-start gap-3 rounded-md border border-reef/15 bg-white/80 p-3 text-sm font-bold text-ink">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 accent-lagoon"
                checked={spreadOrganizers}
                onChange={(event) => setSpreadOrganizers(event.target.checked)}
              />
              <span>
                幹事をできるだけばらけさせる
                <span className="mt-1 block text-xs font-bold text-slate-400">対象: はやと、まさこ、あやなん、こひ</span>
              </span>
            </label>
            <PrimaryButton onClick={generateTeamDraft}>ランダム編成を作成</PrimaryButton>
            {draftTeams.length > 0 && (
              <TeamDraftPreview
                state={state}
                teams={draftTeams}
                onMoveMember={moveDraftMember}
                onConfirm={confirmTeamDraft}
                onCancel={() => setDraftTeams([])}
              />
            )}
          </div>
        </AdminCard>

        <AdminCard title="チーム作成・編集">
          <form className="grid gap-3" onSubmit={submitTeamCreate}>
            <Field>
              新規チーム名
              <input className={inputClass} value={teamName} onChange={(event) => setTeamName(event.target.value)} />
            </Field>
            <Field>
              チーム色
              <input className={inputClass} type="color" value={teamColor} onChange={(event) => setTeamColor(event.target.value)} />
            </Field>
            <PrimaryButton type="submit" disabled={!teamName.trim()}>チーム追加</PrimaryButton>
          </form>
          <form className="mt-5 grid gap-3 border-t border-reef/10 pt-4" onSubmit={submitTeamEdit}>
            <SelectTeam
              state={state}
              value={editTeamId}
              onChange={(value) => {
                const team = state.teams.find((candidate) => candidate.id === value);
                setEditTeamId(value);
                setEditTeamName(team?.name ?? "");
                  setEditTeamColor(team?.color ?? "#00bfd6");
              }}
            />
            <Field>
              チーム名
              <input className={inputClass} value={editTeamName} onChange={(event) => setEditTeamName(event.target.value)} />
            </Field>
            <Field>
              チーム色
              <input className={inputClass} type="color" value={editTeamColor} onChange={(event) => setEditTeamColor(event.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <PrimaryButton type="submit" disabled={!editTeamId || !editTeamName.trim()}>編集</PrimaryButton>
              <DangerButton disabled={!editTeamId} onClick={() => updateState((current) => deleteTeam(current, editTeamId))}>削除</DangerButton>
            </div>
          </form>
        </AdminCard>

        <AdminCard title="メンバー手動移動">
          <div className="grid gap-3">
            <SelectMember state={state} value={moveMemberId} onChange={setMoveMemberId} />
            <SelectTeam state={state} value={moveTeamId} onChange={setMoveTeamId} />
            <PrimaryButton disabled={!moveMemberId || !moveTeamId} onClick={() => updateState((current) => moveMemberToTeam(current, moveMemberId, moveTeamId))}>
              移動する
            </PrimaryButton>
          </div>
        </AdminCard>

        <AdminCard title="ミッション管理">
          <div className="grid gap-3">
            <SelectMission state={state} value={missionId} onChange={setMissionId} />
            <SelectTeam state={state} value={missionTeamId} onChange={setMissionTeamId} />
            <div className="grid grid-cols-2 gap-2">
              <PrimaryButton disabled={!missionId} onClick={() => updateState((current) => setMissionStatus(current, missionId, "active"))}>発動</PrimaryButton>
              <EmergencyButton disabled={!missionId} onClick={() => updateState((current) => setMissionStatus(current, missionId, "active", true))}>緊急発動</EmergencyButton>
              <PrimaryButton disabled={!missionId} onClick={() => updateState((current) => setMissionStatus(current, missionId, "closed"))}>終了</PrimaryButton>
              <PrimaryButton disabled={!missionId || !missionTeamId} onClick={() => updateState((current) => completeMissionForTeam(current, missionId, missionTeamId))}>達成承認</PrimaryButton>
              <div className="col-span-2 grid">
                <DangerButton disabled={!missionId} onClick={() => updateState((current) => deleteMission(current, missionId))}>削除</DangerButton>
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="ミッション作成・編集">
          <div className="grid gap-5">
            <form className="grid gap-3" onSubmit={submitMissionCreate}>
              <MissionFields
                title={missionTitle}
                description={missionDescription}
                rewardCoin={missionRewardCoin}
                difficulty={missionDifficulty}
                targetType={missionTargetType}
                category={missionCategory}
                requirement={missionRequirement}
                requiresPhoto={missionRequiresPhoto}
                requiresCode={missionRequiresCode}
                treasureCode={missionTreasureCode}
                rewardKind={missionRewardKind}
                rewardMode={missionRewardMode}
                rewardItemName={missionRewardItemName}
                rewardItemDescription={missionRewardItemDescription}
                rankingRewards={rankingRewards}
                setTitle={setMissionTitle}
                setDescription={setMissionDescription}
                setRewardCoin={setMissionRewardCoin}
                setDifficulty={setMissionDifficulty}
                setTargetType={setMissionTargetType}
                setCategory={setMissionCategory}
                setRequirement={setMissionRequirement}
                setRequiresPhoto={setMissionRequiresPhoto}
                setRequiresCode={setMissionRequiresCode}
                setTreasureCode={setMissionTreasureCode}
                setRewardKind={setMissionRewardKind}
                setRewardMode={setMissionRewardMode}
                setRewardItemName={setMissionRewardItemName}
                setRewardItemDescription={setMissionRewardItemDescription}
                setRankingRewards={setRankingRewards}
              />
              <PrimaryButton type="submit" disabled={!missionTitle.trim() || (missionRewardKind === "item" && !missionRewardItemName.trim())}>作成して発令</PrimaryButton>
            </form>
            <form className="grid gap-3 border-t border-reef/10 pt-4" onSubmit={submitMissionEdit}>
              <SelectMission
                state={state}
                value={editMissionId}
                onChange={(value) => {
                  const mission = state.missions.find((candidate) => candidate.id === value);
                  setEditMissionId(value);
                  setMissionTitle(mission?.title ?? "");
                  setMissionDescription(mission?.description ?? "");
                  setMissionRewardCoin(mission?.rewardCoin ?? 500);
                  setMissionDifficulty(mission?.difficulty ?? "normal");
                  setMissionTargetType(mission?.targetType ?? "team");
                  setMissionCategory(mission?.category ?? "single");
                  setMissionRequirement(mission?.requirement ?? "optional");
                  setMissionRequiresPhoto(mission?.requiresPhoto ?? true);
                  setMissionRequiresCode(mission?.requiresCode ?? false);
                  setMissionTreasureCode(mission?.treasureCode ?? "");
                  setMissionRewardKind(mission?.rewardKind ?? "coin");
                  setMissionRewardMode(mission?.rewardMode ?? "same");
                  setMissionRewardItemName(mission?.rewardItem?.name ?? "");
                  setMissionRewardItemDescription(mission?.rewardItem?.description ?? "");
                  if (mission?.rankingRewards?.length) {
                    setRankingRewards([1, 2, 3].map((rank) => {
                      const reward = mission.rankingRewards?.find((candidate) => candidate.rank === rank);
                      return {
                        rank,
                        rewardKind: reward?.rewardKind ?? "coin",
                        rewardCoin: reward?.rewardCoin ?? 0,
                        rewardItemName: reward?.rewardItem?.name ?? "",
                        rewardItemDescription: reward?.rewardItem?.description ?? "",
                      };
                    }));
                  }
                }}
              />
              <PrimaryButton type="submit" disabled={!editMissionId || !missionTitle.trim()}>選択中ミッションを上の内容で更新</PrimaryButton>
            </form>
          </div>
        </AdminCard>

        <AdminCard title="写真投稿承認">
          <div className="grid gap-3">
            {state.submissions.length === 0 && <p className="text-sm text-slate-400">まだ写真投稿がありません。</p>}
            {state.submissions.map((submission) => {
              const mission = state.missions.find((candidate) => candidate.id === submission.missionId);
              const team = state.teams.find((candidate) => candidate.id === submission.teamId);
              const member = state.members.find((candidate) => candidate.id === submission.submittedByMemberId);
              const imageUrls = submission.imageUrls ?? [submission.imageUrl].filter(Boolean);
              return (
                <div key={submission.id} className="rounded-md bg-slate-950/50 p-3">
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    {imageUrls.map((url) => (
                      <img key={url} src={url} alt="" className="aspect-video w-full rounded-md object-cover" />
                    ))}
                  </div>
                  <p className="font-black">{mission?.title ?? "ミッション"}</p>
                  <p className="text-sm text-slate-400">{team?.name ?? "チーム"} / 投稿者: {member?.name ?? "不明"} / {submission.status}</p>
                  {submission.comment && <p className="mt-2 text-sm text-slate-300">{submission.comment}</p>}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <PrimaryButton disabled={submission.status !== "pending"} onClick={() => updateState((current) => approveMissionSubmission(current, submission.id))}>
                      承認して達成
                    </PrimaryButton>
                    <DangerButton disabled={submission.status !== "pending"} onClick={() => updateState((current) => rejectMissionSubmission(current, submission.id))}>
                      差し戻し
                    </DangerButton>
                  </div>
                </div>
              );
            })}
          </div>
        </AdminCard>

        <AdminCard title="ランキング報酬確定">
          <div className="grid gap-3">
            <SelectMission
              state={{ missions: state.missions.filter((mission) => mission.rewardMode === "ranking" && mission.status === "active") }}
              value={rankingMissionId}
              onChange={setRankingMissionId}
            />
            {[0, 1, 2].map((index) => (
              <Field key={index}>
                {index + 1}位チーム
                <select
                  className={inputClass}
                  value={rankingTeamIds[index]}
                  onChange={(event) =>
                    setRankingTeamIds((current) => current.map((value, valueIndex) => (valueIndex === index ? event.target.value : value)))
                  }
                >
                  <option value="">選択してください</option>
                  {state.teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
              </Field>
            ))}
            <PrimaryButton
              disabled={!rankingMissionId || rankingTeamIds.every((teamId) => !teamId)}
              onClick={() => updateState((current) => applyRankingRewards(current, rankingMissionId, rankingTeamIds.filter(Boolean)))}
            >
              ランキング報酬を確定
            </PrimaryButton>
          </div>
        </AdminCard>

        <AdminCard title="アイテム付与">
          <div className="grid gap-3">
            <Field>
              アイテム
              <select className={inputClass} value={itemId} onChange={(event) => setItemId(event.target.value)}>
                <option value="">選択してください</option>
                {state.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </Field>
            <SelectMember state={state} value={itemOwnerId} onChange={setItemOwnerId} />
            <p className="text-sm text-slate-400">チーム替え後も所有関係が残るよう、物資・カードは個人へ付与します。</p>
            <PrimaryButton
              disabled={!itemId || !itemOwnerId}
              onClick={() => updateState((current) => assignItemToMember(current, itemId, itemOwnerId))}
            >
              付与する
            </PrimaryButton>
          </div>
        </AdminCard>

        <AdminCard title="オークション落札">
          <div className="grid gap-3">
            <Field>
              景品
              <select className={inputClass} value={auctionId} onChange={(event) => setAuctionId(event.target.value)}>
                <option value="">選択してください</option>
                {state.auctionItems.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </Field>
            <SelectTeam
              state={state}
              value={auctionTeamId}
              onChange={(value) => {
                setAuctionTeamId(value);
                setAuctionWinnerMemberId("");
              }}
            />
            <SelectMemberFromTeam state={state} teamId={auctionTeamId} value={auctionWinnerMemberId} onChange={setAuctionWinnerMemberId} />
            <Field>
              落札価格
              <input className={inputClass} type="number" value={auctionPrice} onChange={(event) => setAuctionPrice(Number(event.target.value))} />
            </Field>
            <PrimaryButton disabled={!auctionId || !auctionTeamId || !auctionWinnerMemberId} onClick={() => updateState((current) => settleAuctionItem(current, auctionId, auctionTeamId, auctionPrice, auctionWinnerMemberId))}>落札処理</PrimaryButton>
          </div>
        </AdminCard>

        <AdminCard title="宝箱コード作成">
          <form className="grid gap-3" onSubmit={createTreasure}>
            <Field>
              コード
              <input className={inputClass} value={treasureCode} onChange={(event) => setTreasureCode(event.target.value)} placeholder="OKI-NEW" />
            </Field>
            <Field>
              宝箱名
              <input className={inputClass} value={treasureTitle} onChange={(event) => setTreasureTitle(event.target.value)} />
            </Field>
            <Field>
              報酬沖コイン
              <input className={inputClass} type="number" value={treasureCoin} onChange={(event) => setTreasureCoin(Number(event.target.value))} />
            </Field>
            <PrimaryButton type="submit">作成する</PrimaryButton>
          </form>
        </AdminCard>

        <AdminCard title="通知作成">
          <form className="grid gap-3" onSubmit={createNotice}>
            <Field>
              タイトル
              <input className={inputClass} value={noticeTitle} onChange={(event) => setNoticeTitle(event.target.value)} />
            </Field>
            <Field>
              本文
              <textarea className={inputClass} value={noticeBody} onChange={(event) => setNoticeBody(event.target.value)} />
            </Field>
            <PrimaryButton type="submit">通知する</PrimaryButton>
          </form>
        </AdminCard>

        <AdminCard title="イベントログ">
          <EventLogList logs={state.eventLogs} />
        </AdminCard>

        <AdminCard title="ゲームリセット">
          <PrimaryButton onClick={reset}>初期状態に戻す</PrimaryButton>
          <p className="mt-2 text-sm text-slate-400">Supabaseと端末キャッシュのゲーム状態を初期化します。</p>
        </AdminCard>
      </div>
    </Shell>
  );
}

function TeamDraftPreview({
  state,
  teams,
  onMoveMember,
  onConfirm,
  onCancel,
}: {
  state: GameState;
  teams: Team[];
  onMoveMember: (memberId: string, teamId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-2 grid gap-3 rounded-md border border-reef/15 bg-cyan-50/70 p-3">
      <div>
        <h3 className="text-base font-black text-ink">編成確認</h3>
        <p className="mt-1 text-sm text-slate-400">必要ならメンバーごとの移動先を変えてから確定してください。確定時に全体へ同期され、ログと通知に残ります。</p>
      </div>
      <div className="grid gap-3">
        {teams.map((team) => {
          const members = state.members.filter((member) => team.memberIds.includes(member.id));
          return (
            <div key={team.id} className="rounded-md border border-white bg-white/90 p-3 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-sm" style={{ background: team.color }} />
                  <p className="font-black text-ink">{team.name}</p>
                </div>
                <p className="text-xs font-black text-lagoon">{members.length}人 / {calculateTeamCoin(team, state.members)}沖</p>
              </div>
              <div className="mt-3 grid gap-2">
                {members.map((member) => (
                  <div key={member.id} className="grid gap-1 rounded-md bg-slate-50 p-2">
                    <p className="text-sm font-black text-ink">{member.name}</p>
                    <select className={inputClass} value={team.id} onChange={(event) => onMoveMember(member.id, event.target.value)}>
                      {teams.map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>{candidate.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <PrimaryButton onClick={onConfirm}>この編成で確定</PrimaryButton>
        <DangerButton onClick={onCancel}>破棄</DangerButton>
      </div>
    </div>
  );
}

function DangerButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-11 rounded-md bg-red-500 px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function EmergencyButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-11 rounded-md bg-ember px-4 py-2 text-sm font-black text-white shadow-[0_8px_22px_rgba(255,43,147,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
    >
      {children}
    </button>
  );
}

function MissionFields({
  title,
  description,
  rewardCoin,
  difficulty,
  targetType,
  category,
  requirement,
  requiresPhoto,
  requiresCode,
  treasureCode,
  rewardKind,
  rewardMode,
  rewardItemName,
  rewardItemDescription,
  rankingRewards,
  setTitle,
  setDescription,
  setRewardCoin,
  setDifficulty,
  setTargetType,
  setCategory,
  setRequirement,
  setRequiresPhoto,
  setRequiresCode,
  setTreasureCode,
  setRewardKind,
  setRewardMode,
  setRewardItemName,
  setRewardItemDescription,
  setRankingRewards,
}: {
  title: string;
  description: string;
  rewardCoin: number;
  difficulty: MissionDifficulty;
  targetType: MissionTargetType;
  category: MissionCategory;
  requirement: MissionRequirement;
  requiresPhoto: boolean;
  requiresCode: boolean;
  treasureCode: string;
  rewardKind: MissionRewardKind;
  rewardMode: MissionRewardMode;
  rewardItemName: string;
  rewardItemDescription: string;
  rankingRewards: Array<{ rank: number; rewardKind: MissionRewardKind; rewardCoin: number; rewardItemName: string; rewardItemDescription: string }>;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setRewardCoin: (value: number) => void;
  setDifficulty: (value: MissionDifficulty) => void;
  setTargetType: (value: MissionTargetType) => void;
  setCategory: (value: MissionCategory) => void;
  setRequirement: (value: MissionRequirement) => void;
  setRequiresPhoto: (value: boolean) => void;
  setRequiresCode: (value: boolean) => void;
  setTreasureCode: (value: string) => void;
  setRewardKind: (value: MissionRewardKind) => void;
  setRewardMode: (value: MissionRewardMode) => void;
  setRewardItemName: (value: string) => void;
  setRewardItemDescription: (value: string) => void;
  setRankingRewards: (value: Array<{ rank: number; rewardKind: MissionRewardKind; rewardCoin: number; rewardItemName: string; rewardItemDescription: string }>) => void;
}) {
  const forcedRequired = category === "emergency-treasure" || category === "emergency-battle";
  const codeRequired = requiresCode || category === "emergency-treasure";
  return (
    <>
      <Field>
        タイトル
        <input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} />
      </Field>
      <Field>
        説明
        <textarea className={inputClass} value={description} onChange={(event) => setDescription(event.target.value)} />
      </Field>
      <Field>
        種類
        <select className={inputClass} value={category} onChange={(event) => setCategory(event.target.value as MissionCategory)}>
          <option value="permanent-1">常設ミッション1セット</option>
          <option value="permanent-2">常設ミッション2セット</option>
          <option value="emergency-treasure">緊急宝探しミッション</option>
          <option value="emergency-battle">緊急バトルミッション</option>
          <option value="single">単発ミッション</option>
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field>
          必須/任意
          <select className={inputClass} value={forcedRequired ? "required" : requirement} onChange={(event) => setRequirement(event.target.value as MissionRequirement)} disabled={forcedRequired}>
            <option value="required">必須</option>
            <option value="optional">任意</option>
          </select>
        </Field>
        <Field>
          報酬形式
          <select className={inputClass} value={rewardMode} onChange={(event) => setRewardMode(event.target.value as MissionRewardMode)}>
            <option value="same">全チーム同一報酬</option>
            <option value="ranking">ランキング報酬</option>
          </select>
        </Field>
      </div>
      <div className="grid gap-2 rounded-md border border-reef/15 bg-white/80 p-3">
        <label className="flex items-center gap-2 text-sm font-bold text-ink">
          <input type="checkbox" className="h-5 w-5 accent-lagoon" checked={requiresPhoto} onChange={(event) => setRequiresPhoto(event.target.checked)} />
          写真投稿を必要にする
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-ink">
          <input type="checkbox" className="h-5 w-5 accent-lagoon" checked={codeRequired} onChange={(event) => setRequiresCode(event.target.checked)} disabled={category === "emergency-treasure"} />
          コード入力を必要にする
        </label>
      </div>
      {codeRequired && (
        <Field>
          正解コード
          <input className={inputClass} value={treasureCode} onChange={(event) => setTreasureCode(event.target.value)} placeholder="OKI-001" />
        </Field>
      )}
      <Field>
        報酬タイプ
        <select className={inputClass} value={rewardKind} onChange={(event) => setRewardKind(event.target.value as MissionRewardKind)}>
          <option value="coin">沖コイン</option>
          <option value="item">物資・カード</option>
        </select>
      </Field>
      {rewardKind === "coin" ? (
        <Field>
          報酬沖コイン
          <input className={inputClass} type="number" value={rewardCoin} onChange={(event) => setRewardCoin(Number(event.target.value))} />
        </Field>
      ) : (
        <div className="grid gap-2 rounded-md border border-reef/15 bg-white/80 p-3">
          <Field>
            カード名
            <input className={inputClass} value={rewardItemName} onChange={(event) => setRewardItemName(event.target.value)} />
          </Field>
          <Field>
            カード説明
            <textarea className={inputClass} value={rewardItemDescription} onChange={(event) => setRewardItemDescription(event.target.value)} />
          </Field>
        </div>
      )}
      <input type="hidden" value={difficulty} onChange={(event) => setDifficulty(event.target.value as MissionDifficulty)} />
      <input type="hidden" value={targetType} onChange={(event) => setTargetType(event.target.value as MissionTargetType)} />
      {rewardMode === "ranking" && (
        <div className="grid gap-3 rounded-md border border-reef/15 bg-white/80 p-3">
          <p className="text-sm font-black text-ink">ランキング報酬</p>
          {rankingRewards.map((reward, index) => (
            <div key={reward.rank} className="grid gap-2 rounded-md bg-cyan-50/70 p-2">
              <p className="text-sm font-black text-reef">{reward.rank}位</p>
              <Field>
                報酬タイプ
                <select
                  className={inputClass}
                  value={reward.rewardKind}
                  onChange={(event) => setRankingRewards(rankingRewards.map((current, currentIndex) => currentIndex === index ? { ...current, rewardKind: event.target.value as MissionRewardKind } : current))}
                >
                  <option value="coin">沖コイン</option>
                  <option value="item">物資・カード</option>
                </select>
              </Field>
              {reward.rewardKind === "coin" ? (
                <Field>
                  報酬沖コイン
                  <input
                    className={inputClass}
                    type="number"
                    value={reward.rewardCoin}
                    onChange={(event) => setRankingRewards(rankingRewards.map((current, currentIndex) => currentIndex === index ? { ...current, rewardCoin: Number(event.target.value) } : current))}
                  />
                </Field>
              ) : (
                <>
                  <Field>
                    カード名
                    <input
                      className={inputClass}
                      value={reward.rewardItemName}
                      onChange={(event) => setRankingRewards(rankingRewards.map((current, currentIndex) => currentIndex === index ? { ...current, rewardItemName: event.target.value } : current))}
                    />
                  </Field>
                  <Field>
                    カード説明
                    <textarea
                      className={inputClass}
                      value={reward.rewardItemDescription}
                      onChange={(event) => setRankingRewards(rankingRewards.map((current, currentIndex) => currentIndex === index ? { ...current, rewardItemDescription: event.target.value } : current))}
                    />
                  </Field>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function AdminCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <h2 className="mb-3 text-lg font-black text-lagoon">{title}</h2>
      {children}
    </Card>
  );
}

function SelectMember({ state, value, onChange }: { state: { members: { id: string; name: string }[] }; value: string; onChange: (value: string) => void }) {
  return (
    <Field>
      メンバー
      <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">選択してください</option>
        {state.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
      </select>
    </Field>
  );
}

function SelectTeam({ state, value, onChange }: { state: { teams: { id: string; name: string }[] }; value: string; onChange: (value: string) => void }) {
  return (
    <Field>
      チーム
      <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">選択してください</option>
        {state.teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
      </select>
    </Field>
  );
}

function SelectMemberFromTeam({
  state,
  teamId,
  value,
  onChange,
}: {
  state: { members: { id: string; name: string; currentTeamId?: string }[] };
  teamId: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const members = state.members.filter((member) => member.currentTeamId === teamId);
  return (
    <Field>
      受け取りメンバー
      <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)} disabled={!teamId}>
        <option value="">選択してください</option>
        {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
      </select>
    </Field>
  );
}

function SelectMission({ state, value, onChange }: { state: { missions: { id: string; title: string }[] }; value: string; onChange: (value: string) => void }) {
  return (
    <Field>
      ミッション
      <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">選択してください</option>
        {state.missions.map((mission) => <option key={mission.id} value={mission.id}>{mission.title}</option>)}
      </select>
    </Field>
  );
}
