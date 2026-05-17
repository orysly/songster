import { useState } from "react";
import { Users, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import type { GameState, Player } from "../types/game";
import { Button } from "../components/shared/Button";

type Props = {
  state: GameState;
  currentPlayer: Player;
  onSubmit: (votes: Record<string, "before" | "correct" | "after">) => void;
};

export function ChallengeScreen({ state, currentPlayer, onSubmit }: Props) {
  const challengers = state.players.filter((p) => p.id !== currentPlayer.id);
  const [votes, setVotes] = useState<Record<string, "before" | "correct" | "after">>({});

  const allVoted = Object.keys(votes).length === challengers.length;

  function handleVote(playerId: string, option: "before" | "correct" | "after") {
    setVotes((prev) => ({
      ...prev,
      [playerId]: option
    }));
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pb-safe-bottom pt-8 text-white min-h-screen justify-center">
      <header className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 ring-1 ring-brand-500/20">
          <Users className="h-7 w-7 text-brand-500 animate-pulse" />
        </div>
        <h1 className="text-3xl font-black tracking-tight mt-4">Steal/Challenge Phase!</h1>
        <p className="text-sm text-white/60">
          <span className="font-bold text-white">{currentPlayer.name}</span> locked their timeline placement.
          <br />
          Other players, predict where the song actually belongs!
        </p>
      </header>

      <section className="space-y-4">
        {challengers.map((challenger) => {
          const currentVote = votes[challenger.id];
          return (
            <div
              key={challenger.id}
              className={`rounded-2xl bg-white/10 p-5 ring-1 transition-all duration-300 ${
                currentVote ? "ring-brand-500/40 bg-brand-500/5" : "ring-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-black text-lg">{challenger.name}</span>
                <span className="text-xs font-bold text-white/55">({challenger.score} pts)</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleVote(challenger.id, "before")}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-sm font-bold transition-all ${
                    currentVote === "before"
                      ? "bg-brand-500 border-brand-500 text-white shadow-glow"
                      : "bg-ink border-white/15 text-white/65 hover:border-white/30"
                  }`}
                >
                  <ArrowLeft className="h-5 w-5 mb-1" />
                  Before (Older)
                </button>

                <button
                  type="button"
                  onClick={() => handleVote(challenger.id, "correct")}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-sm font-bold transition-all ${
                    currentVote === "correct"
                      ? "bg-brand-500 border-brand-500 text-white shadow-glow"
                      : "bg-ink border-white/15 text-white/65 hover:border-white/30"
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5 mb-1" />
                  Spot On
                </button>

                <button
                  type="button"
                  onClick={() => handleVote(challenger.id, "after")}
                  className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border text-sm font-bold transition-all ${
                    currentVote === "after"
                      ? "bg-brand-500 border-brand-500 text-white shadow-glow"
                      : "bg-ink border-white/15 text-white/65 hover:border-white/30"
                  }`}
                >
                  <ArrowRight className="h-5 w-5 mb-1" />
                  After (Newer)
                </button>
              </div>
            </div>
          );
        })}
      </section>

      <div className="mt-4">
        <Button
          disabled={!allVoted}
          className={`w-full min-h-12 justify-center font-bold tracking-widest uppercase transition-all ${
            allVoted 
              ? "bg-brand-500 text-white shadow-lg hover:bg-brand-400" 
              : "opacity-40"
          }`}
          onClick={() => onSubmit(votes)}
        >
          {allVoted ? "Submit Challenge & Reveal" : "All Players Must Vote!"}
        </Button>
      </div>
    </main>
  );
}
