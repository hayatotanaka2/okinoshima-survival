"use client";

import { useEffect, useMemo, useState } from "react";
import { loadSelectedMemberId, saveSelectedMemberId } from "./storage";
import type { GameState } from "./types";

export function useSelectedMember(state?: GameState | null) {
  const [selectedMemberId, setSelectedMemberIdState] = useState("");

  useEffect(() => {
    setSelectedMemberIdState(loadSelectedMemberId());
  }, []);

  useEffect(() => {
    if (!state || !selectedMemberId) return;
    if (!state.members.some((member) => member.id === selectedMemberId)) {
      setSelectedMemberIdState("");
      saveSelectedMemberId("");
    }
  }, [selectedMemberId, state]);

  const selectedMember = useMemo(() => {
    return state?.members.find((member) => member.id === selectedMemberId) ?? null;
  }, [selectedMemberId, state]);

  function setSelectedMemberId(memberId: string) {
    setSelectedMemberIdState(memberId);
    saveSelectedMemberId(memberId);
  }

  return { selectedMemberId, selectedMember, setSelectedMemberId };
}
