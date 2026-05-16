import type { Track } from "../types/game";

export function shuffleTracks(tracks: Track[]): Track[] {
  const shuffled = [...tracks];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function getRandomSnippetStartMs(durationMs: number, snippetSeconds: number): number {
  const snippetMs = snippetSeconds * 1000;
  const earliest = 10_000;
  const latest = durationMs - snippetMs - 5_000;
  if (durationMs <= snippetMs || latest <= earliest) return 0;
  return Math.floor(earliest + Math.random() * (latest - earliest));
}
