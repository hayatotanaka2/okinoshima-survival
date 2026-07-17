"use client";

import { FormEvent, useState } from "react";
import type { ReactNode } from "react";
import { Card, Field, PrimaryButton, inputClass } from "@/components/Cards";
import { EventLogList } from "@/components/Lists";
import { Shell } from "@/components/Shell";
import { settleAuctionItem } from "@/lib/auctionLogic";
import { addCoinToMember, subtractCoinFromMember } from "@/lib/coinLogic";
import { addEventLog, addNotification, uid } from "@/lib/gameLogic";
import { assignItemToMember, assignItemToTeam } from "@/lib/itemLogic";
import { deleteMember, updateMemberName } from "@/lib/memberLogic";
import { approveMissionSubmission, completeMissionForTeam, createMission, deleteMission, rejectMissionSubmission, setMissionStatus, updateMission } from "@/lib/missionLogic";
import { addTeam, deleteTeam, moveMemberToTeam, randomizeTeams, updateTeam } from "@/lib/teamLogic";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { useGameState } from "@/lib/useGameState";
import type { MissionDifficulty, MissionTargetType, Treasure } from "@/lib/types";

export default function AdminPage() {
  const { state, updateState, reset } = useGameState();
  const [passcode, setPasscode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [teamCount, setTeamCount] = useState(4);
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
  const [editMissionId, setEditMissionId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamColor, setTeamColor] = useState("#19b7a6");
  const [editTeamId, setEditTeamId] = useState("");
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamColor, setEditTeamColor] = useState("#19b7a6");
  const [itemId, setItemId] = useState("");
  const [itemOwnerId, setItemOwnerId] = useState("");
  const [itemOwnerType, setItemOwnerType] = useState<"member" | "team">("member");
  const [auctionId, setAuctionId] = useState("");
  const [auctionTeamId, setAuctionTeamId] = useState("");
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
      }),
    );
    setMissionTitle("");
    setMissionDescription("");
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

  return (
    <Shell title="管理者">
      <div className="grid gap-4">
        <AdminCard title="本番同期ステータス">
          <div className={`rounded-md p-3 text-sm font-bold ${isSupabaseConfigured() ? "bg-lagoon text-slate-950" : "bg-ember text-slate-950"}`}>
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
            <PrimaryButton onClick={() => updateState((current) => randomizeTeams(current, teamCount))}>ランダム再編成</PrimaryButton>
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
          <form className="mt-5 grid gap-3 border-t border-white/10 pt-4" onSubmit={submitTeamEdit}>
            <SelectTeam
              state={state}
              value={editTeamId}
              onChange={(value) => {
                const team = state.teams.find((candidate) => candidate.id === value);
                setEditTeamId(value);
                setEditTeamName(team?.name ?? "");
                setEditTeamColor(team?.color ?? "#19b7a6");
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
              <PrimaryButton disabled={!missionId} onClick={() => updateState((current) => setMissionStatus(current, missionId, "closed"))}>終了</PrimaryButton>
              <PrimaryButton disabled={!missionId || !missionTeamId} onClick={() => updateState((current) => completeMissionForTeam(current, missionId, missionTeamId))}>達成承認</PrimaryButton>
              <DangerButton disabled={!missionId} onClick={() => updateState((current) => deleteMission(current, missionId))}>削除</DangerButton>
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
                setTitle={setMissionTitle}
                setDescription={setMissionDescription}
                setRewardCoin={setMissionRewardCoin}
                setDifficulty={setMissionDifficulty}
                setTargetType={setMissionTargetType}
              />
              <PrimaryButton type="submit" disabled={!missionTitle.trim()}>新規作成</PrimaryButton>
            </form>
            <form className="grid gap-3 border-t border-white/10 pt-4" onSubmit={submitMissionEdit}>
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
              return (
                <div key={submission.id} className="rounded-md bg-slate-950/50 p-3">
                  <img src={submission.imageUrl} alt="" className="mb-3 aspect-video w-full rounded-md object-cover" />
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

        <AdminCard title="アイテム付与">
          <div className="grid gap-3">
            <Field>
              アイテム
              <select className={inputClass} value={itemId} onChange={(event) => setItemId(event.target.value)}>
                <option value="">選択してください</option>
                {state.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </Field>
            <Field>
              付与先
              <select className={inputClass} value={itemOwnerType} onChange={(event) => setItemOwnerType(event.target.value as "member" | "team")}>
                <option value="member">個人</option>
                <option value="team">チーム</option>
              </select>
            </Field>
            {itemOwnerType === "member" ? <SelectMember state={state} value={itemOwnerId} onChange={setItemOwnerId} /> : <SelectTeam state={state} value={itemOwnerId} onChange={setItemOwnerId} />}
            <PrimaryButton
              disabled={!itemId || !itemOwnerId}
              onClick={() => updateState((current) => itemOwnerType === "member" ? assignItemToMember(current, itemId, itemOwnerId) : assignItemToTeam(current, itemId, itemOwnerId))}
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
            <SelectTeam state={state} value={auctionTeamId} onChange={setAuctionTeamId} />
            <Field>
              落札価格
              <input className={inputClass} type="number" value={auctionPrice} onChange={(event) => setAuctionPrice(Number(event.target.value))} />
            </Field>
            <PrimaryButton disabled={!auctionId || !auctionTeamId} onClick={() => updateState((current) => settleAuctionItem(current, auctionId, auctionTeamId, auctionPrice))}>落札処理</PrimaryButton>
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

function MissionFields({
  title,
  description,
  rewardCoin,
  difficulty,
  targetType,
  setTitle,
  setDescription,
  setRewardCoin,
  setDifficulty,
  setTargetType,
}: {
  title: string;
  description: string;
  rewardCoin: number;
  difficulty: MissionDifficulty;
  targetType: MissionTargetType;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setRewardCoin: (value: number) => void;
  setDifficulty: (value: MissionDifficulty) => void;
  setTargetType: (value: MissionTargetType) => void;
}) {
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
      <div className="grid gap-2">
        <Field>
          報酬沖コイン
          <input className={inputClass} type="number" value={rewardCoin} onChange={(event) => setRewardCoin(Number(event.target.value))} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field>
          難易度
          <select className={inputClass} value={difficulty} onChange={(event) => setDifficulty(event.target.value as MissionDifficulty)}>
            <option value="easy">easy</option>
            <option value="normal">normal</option>
            <option value="hard">hard</option>
            <option value="legend">legend</option>
          </select>
        </Field>
        <Field>
          対象
          <select className={inputClass} value={targetType} onChange={(event) => setTargetType(event.target.value as MissionTargetType)}>
            <option value="team">team</option>
            <option value="individual">individual</option>
          </select>
        </Field>
      </div>
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
