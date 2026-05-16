import type { Player, RoundScoreInput } from "../types/game";

export function calculateRoundScore({
  placementCorrect,
  artistCorrect,
  titleCorrect
}: RoundScoreInput): number {
  if (!placementCorrect) return 0;
  let total = 5;
  if (artistCorrect) total += 5;
  if (titleCorrect) total += 5;
  return total;
}

export function getNextPlayerIndex(players: Player[], currentPlayerIndex: number): number {
  if (players.length === 0) return 0;
  return (currentPlayerIndex + 1) % players.length;
}

export function getWinner(players: Player[], targetScore: number): Player | null {
  return players.find((player) => player.score >= targetScore) ?? null;
}
