"use client";

import { createInitialGameState } from "./seed";
import { GAME_STATE_ID, isSupabaseConfigured, supabase } from "./supabaseClient";
import { loadGameState, normalizeGameState, saveGameState } from "./storage";
import type { GameState } from "./types";

type GameStateRow = {
  id: string;
  state: GameState;
  updated_at: string;
};

export async function loadSharedGameState(): Promise<GameState> {
  if (!isSupabaseConfigured() || !supabase) {
    return loadGameState();
  }

  const { data, error } = await supabase
    .from("game_states")
    .select("id,state,updated_at")
    .eq("id", GAME_STATE_ID)
    .maybeSingle();

  if (error) {
    console.warn("Supabase load failed. Falling back to localStorage.", error.message);
    return loadGameState();
  }

  const row = data as GameStateRow | null;

  if (!row?.state) {
    const initialState = createInitialGameState();
    await saveSharedGameState(initialState);
    return initialState;
  }

  const normalized = normalizeGameState(row.state);
  saveGameState(normalized);
  return normalized;
}

export async function saveSharedGameState(state: GameState): Promise<void> {
  saveGameState(state);

  if (!isSupabaseConfigured() || !supabase) return;

  const { error } = await supabase.from("game_states").upsert({
    id: GAME_STATE_ID,
    state: normalizeGameState(state),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.warn("Supabase save failed. Local cache was updated.", error.message);
  }
}

export function subscribeSharedGameState(onChange: (state: GameState) => void): () => void {
  if (!isSupabaseConfigured() || !supabase) {
    return () => undefined;
  }

  const client = supabase;
  const channel = client
    .channel("game-state-main")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "game_states",
        filter: `id=eq.${GAME_STATE_ID}`,
      },
      (payload) => {
        const next = (payload.new as GameStateRow | null)?.state;
        if (next) {
          const normalized = normalizeGameState(next);
          saveGameState(normalized);
          onChange(normalized);
        }
      },
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
