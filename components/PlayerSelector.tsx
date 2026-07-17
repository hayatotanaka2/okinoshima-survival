"use client";

import { Card, Field, inputClass } from "@/components/Cards";
import { useSelectedMember } from "@/lib/useSelectedMember";
import type { GameState } from "@/lib/types";

export function PlayerSelector({ state, compact = false }: { state: GameState; compact?: boolean }) {
  const { selectedMemberId, selectedMember, setSelectedMemberId } = useSelectedMember(state);
  const team = state.teams.find((candidate) => candidate.id === selectedMember?.currentTeamId);

  return (
    <Card className={compact ? "p-3" : ""}>
      <Field>
        この端末のプレイヤー
        <select className={inputClass} value={selectedMemberId} onChange={(event) => setSelectedMemberId(event.target.value)}>
          <option value="">自分の名前を選択</option>
          {state.members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </Field>
      <p className="mt-2 text-sm text-slate-400">
        {selectedMember
          ? `${selectedMember.name} / ${team?.name ?? "未所属"} / ${selectedMember.coin}沖`
          : "このスマホで使う自分の名前を一度選ぶと、次回起動時も復元されます。"}
      </p>
    </Card>
  );
}
