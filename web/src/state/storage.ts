import type { Regatta } from "@race-manager/core";

export interface AppState {
  regatten: Regatta[];
  aktiveRegattaId: string | null;
}

const KEY = "race-manager:v1";

export function ladeState(): AppState {
  try {
    const roh = localStorage.getItem(KEY);
    if (roh) {
      const state = JSON.parse(roh) as AppState;
      if (Array.isArray(state.regatten)) return state;
    }
  } catch {
    // defekter/blockierter Storage → leer starten
  }
  return { regatten: [], aktiveRegattaId: null };
}

export function speichereState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Speichern darf die App nie zum Absturz bringen (z.B. privater Modus)
  }
}
