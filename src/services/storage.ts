import { BRAND } from "../config/brand";
import type { GameState } from "../types/game";
import type { SpotifyTokenSet } from "../types/spotify";

const GAME_VERSION = 1;

type StoredGame = {
  version: number;
  state: GameState;
};

export function saveGameState(state: GameState): void {
  localStorage.setItem(BRAND.storageKey, JSON.stringify({ version: GAME_VERSION, state }));
}

export function loadGameState(): GameState | null {
  const raw = localStorage.getItem(BRAND.storageKey);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredGame;
    if (parsed.version !== GAME_VERSION) return null;
    return { ...parsed.state, restoredFromStorage: false };
  } catch {
    return null;
  }
}

export function clearGameState(): void {
  localStorage.removeItem(BRAND.storageKey);
}

export function saveTokenSet(tokenSet: SpotifyTokenSet): void {
  localStorage.setItem(BRAND.tokenStorageKey, JSON.stringify(tokenSet));
}

export function loadTokenSet(): SpotifyTokenSet | null {
  const raw = localStorage.getItem(BRAND.tokenStorageKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SpotifyTokenSet;
  } catch {
    return null;
  }
}

export function clearTokenSet(): void {
  localStorage.removeItem(BRAND.tokenStorageKey);
}

export function saveAuthScratch(value: Record<string, string>): void {
  localStorage.setItem(BRAND.authStorageKey, JSON.stringify(value));
}

export function loadAuthScratch(): Record<string, string> | null {
  const raw = localStorage.getItem(BRAND.authStorageKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return null;
  }
}

export function clearAuthScratch(): void {
  localStorage.removeItem(BRAND.authStorageKey);
}
