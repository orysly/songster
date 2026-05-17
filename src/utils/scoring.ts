import type { Player, RoundScoreInput } from "../types/game";

export function calculateRoundScore({
  placementCorrect,
  artistCorrect,
  titleCorrect,
  doubleOrNothing
}: RoundScoreInput): number {
  let correctCount = 0;
  if (placementCorrect) correctCount++;
  if (artistCorrect) correctCount++;
  if (titleCorrect) correctCount++;

  if (doubleOrNothing) {
    if (correctCount === 3) {
      return 30; // Double points for guessing everything correctly
    } else {
      // Lose 5 points per incorrect guess
      return (3 - correctCount) * -5;
    }
  }

  // Standard mode: independent points for every correct guess
  return correctCount * 5;
}

export function getNextPlayerIndex(players: Player[], currentPlayerIndex: number): number {
  if (players.length === 0) return 0;
  return (currentPlayerIndex + 1) % players.length;
}

export function getWinner(players: Player[], targetScore: number): Player | null {
  return players.find((player) => player.score >= targetScore) ?? null;
}
