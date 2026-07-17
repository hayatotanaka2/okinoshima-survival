"use client";

import { useState } from "react";
import { Card, Field, PrimaryButton, inputClass } from "@/components/Cards";
import { TeamRow } from "@/components/Lists";
import { Shell } from "@/components/Shell";
import { randomizeTeams } from "@/lib/teamLogic";
import { useGameState } from "@/lib/useGameState";

export default function ComposePage() {
  const { state, updateState } = useGameState();
  const [teamCount, setTeamCount] = useState(4);

  if (!state) return <Shell title="チーム編成"><p>読み込み中...</p></Shell>;

  return (
    <Shell title="チーム編成">
      <div className="grid gap-4">
        <Card>
          <Field>
            チーム数
            <input
              className={inputClass}
              type="number"
              min={2}
              max={6}
              value={teamCount}
              onChange={(event) => setTeamCount(Number(event.target.value))}
            />
          </Field>
          <div className="mt-3">
            <PrimaryButton onClick={() => updateState((current) => randomizeTeams(current, teamCount))}>
              ランダム編成する
            </PrimaryButton>
          </div>
          <p className="mt-3 text-sm text-slate-400">人数がなるべく均等になるように編成します。</p>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-black">現在の編成</h2>
          <div className="grid gap-2">
            {state.teams.length === 0 ? (
              <p className="text-sm text-slate-400">まだ編成されていません。</p>
            ) : (
              state.teams.map((team) => <TeamRow key={team.id} team={team} state={state} />)
            )}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
