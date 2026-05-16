import { Trophy } from "lucide-react";
import { Button } from "../components/shared/Button";
import { Scoreboard } from "../components/shared/Scoreboard";
import type { GameState, Player } from "../types/game";

type Props = {
  state: GameState;
  winner: Player | null;
  onPlayAgain: () => void;
  onNewGame: () => void;
};

export function WinnerScreen({
  state,
  winner,
  onPlayAgain,
  onNewGame
}: Props) {
  const ranked = [...state.players].sort((a, b) => b.score - a.score);
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-safe-bottom pt-safe-top text-white">
      <section className="pt-10 text-center">
        <div className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full bg-white text-ink shadow-glow">
          <Trophy className="h-12 w-12" />
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/55">
          {state.turn.deckRunOut ? "Playlist finished" : "Winner"}
        </p>
        <h1 className="mt-3 text-5xl font-black leading-none">
          {winner ? winner.name : "Final ranking"}
        </h1>
        {state.turn.deckRunOut ? (
          <p className="mx-auto mt-4 max-w-sm text-white/70">
            The playlist ran out of tracks before someone reached the target score.
          </p>
        ) : null}
      </section>
      <Scoreboard players={ranked} currentPlayerId={winner?.id} />
      <section className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
        <h2 className="mb-3 text-xl font-black">Timelines</h2>
        <div className="space-y-2">
          {ranked.map((player) => (
            <div key={player.id} className="flex items-center justify-between rounded-xl bg-ink/60 p-3">
              <span className="font-bold">{player.name}</span>
              <span className="text-white/65">
                {player.timeline.filter((track) => !track.isYearMarker).length} songs
              </span>
            </div>
          ))}
        </div>
      </section>
      <div className="grid gap-2">
        <Button onClick={onPlayAgain}>Play again with same players</Button>
        <Button variant="ghost" onClick={onNewGame}>
          New game
        </Button>
      </div>
    </main>
  );
}
