"use client";

import { useEffect, useState } from "react";
import { loadSharedGameState, saveSharedGameState, subscribeSharedGameState } from "./repository";
import { resetGameState } from "./storage";
import type { GameState } from "./types";

export function useGameState() {
  const [state, setState] = useState<GameState | null>(null);

  useEffect(() => {
    let active = true;
    loadSharedGameState().then((loaded) => {
      if (active) setState(loaded);
    });
    const unsubscribe = subscribeSharedGameState((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  function updateState(updater: (current: GameState) => GameState) {
    setState((current) => {
      const base = current;
      if (!base) return current;
      const next = { ...updater(base), updatedAt: new Date().toISOString() };
      void saveSharedGameState(next);
      return next;
    });
  }

  function reset() {
    const initialState = resetGameState();
    setState(initialState);
    void saveSharedGameState(initialState);
  }

  return { state, updateState, reset };
}
