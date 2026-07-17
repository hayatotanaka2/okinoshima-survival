"use client";

import { createInitialGameState } from "./seed";
import type { GameState } from "./types";

const STORAGE_KEY = "okinoshima-survival-state";

export function loadGameState(): GameState {
  if (typeof window === "undefined") {
    return createInitialGameState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initialState = createInitialGameState();
    saveGameState(initialState);
    return initialState;
  }

  try {
    return normalizeGameState(JSON.parse(raw) as GameState);
  } catch {
    const initialState = createInitialGameState();
    saveGameState(initialState);
    return initialState;
  }
}

export function normalizeGameState(state: GameState): GameState {
  return {
    ...state,
    submissions: state.submissions ?? [],
    eventLogs: state.eventLogs ?? [],
    notifications: state.notifications ?? [],
    treasures: state.treasures ?? [],
  };
}

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetGameState(): GameState {
  const state = createInitialGameState();
  saveGameState(state);
  return state;
}
