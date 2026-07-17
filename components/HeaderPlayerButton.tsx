"use client";

import { useState } from "react";
import { inputClass } from "@/components/Cards";
import { useGameState } from "@/lib/useGameState";
import { useSelectedMember } from "@/lib/useSelectedMember";

export function HeaderPlayerButton() {
  const { state } = useGameState();
  const { selectedMemberId, selectedMember, setSelectedMemberId } = useSelectedMember(state);
  const [open, setOpen] = useState(false);

  if (!state || !selectedMember) return null;

  const initial = selectedMember.name.slice(0, 1);

  return (
    <>
      <button
        type="button"
        className="ml-auto grid h-11 w-11 place-items-center rounded-full border border-reef/15 bg-white text-sm font-black text-reef shadow-sm"
        onClick={() => setOpen(true)}
        aria-label="この端末のプレイヤーを変更"
      >
        {initial}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-reef/25 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-md border border-reef/15 bg-white p-4 shadow-[0_24px_70px_rgba(67,54,130,0.22)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black text-reef">PLAYER</p>
                <h2 className="text-xl font-black text-ink">この端末のプレイヤー</h2>
              </div>
              <button className="rounded-md px-3 py-1 text-lg font-black text-slate-400" onClick={() => setOpen(false)} aria-label="閉じる">
                x
              </button>
            </div>
            <select className={`${inputClass} mt-4 w-full`} value={selectedMemberId} onChange={(event) => setSelectedMemberId(event.target.value)}>
              <option value="">自分の名前を選択</option>
              {state.members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-slate-400">{selectedMember.name}として操作します。</p>
          </div>
        </div>
      )}
    </>
  );
}
