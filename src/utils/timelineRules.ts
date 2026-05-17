import type { Track } from "../types/game";

export function isCorrectPlacement(
  timeline: Track[],
  track: Track,
  insertionIndex: number
): boolean {
  if (insertionIndex < 0 || insertionIndex > timeline.length) return false;
  const previous = timeline[insertionIndex - 1];
  const next = timeline[insertionIndex];
  const afterPrevious = !previous || previous.releaseYear <= track.releaseYear;
  const beforeNext = !next || track.releaseYear <= next.releaseYear;
  return afterPrevious && beforeNext;
}

export function determineChallengeResult(
  timeline: Track[],
  track: Track,
  insertionIndex: number
): "before" | "correct" | "after" {
  if (isCorrectPlacement(timeline, track, insertionIndex)) {
    return "correct";
  }
  const previous = timeline[insertionIndex - 1];
  if (previous && track.releaseYear < previous.releaseYear) {
    return "before";
  }
  return "after";
}

export function getCorrectInsertionRange(
  timeline: Track[],
  track: Track
): { minIndex: number; maxIndex: number } {
  if (timeline.length === 0) return { minIndex: 0, maxIndex: 0 };

  let minIndex = 0;
  while (minIndex < timeline.length && timeline[minIndex].releaseYear < track.releaseYear) {
    minIndex += 1;
  }

  let maxIndex = minIndex;
  while (maxIndex < timeline.length && timeline[maxIndex].releaseYear === track.releaseYear) {
    maxIndex += 1;
  }

  return { minIndex, maxIndex };
}

export function insertTrackIntoTimeline(
  timeline: Track[],
  track: Track,
  insertionIndex: number
): Track[] {
  return [...timeline.slice(0, insertionIndex), track, ...timeline.slice(insertionIndex)];
}
