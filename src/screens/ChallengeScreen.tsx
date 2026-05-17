import { useState } from "react";
import { Users, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import type { GameState, Player } from "../types/game";
import { Timeline } from "../components/game/Timeline";

type Props = {
  state: GameState;
  currentPlayer: Player;
  onSubmit: (votes: Record<string, "before" | "correct" | "after">) => void;
};

export function ChallengeScreen({ state, currentPlayer, onSubmit }: Props) {
  const challengers = state.players.filter((p) => p.id !== currentPlayer.id);
  const [votes, setVotes] = useState<Record<string, "before" | "correct" | "after">>({});

  const allVoted = Object.keys(votes).length === challengers.length;

  const selectedIndex = state.turn.selectedInsertionIndex ?? 0;
  const previousTrack = currentPlayer.timeline[selectedIndex - 1];
  const nextTrack = currentPlayer.timeline[selectedIndex];

  const beforeYear = previousTrack ? previousTrack.releaseYear : null;
  const afterYear = nextTrack ? nextTrack.releaseYear : null;

  let beforeSub = "Older";
  let correctSub = "Spot On";
  let afterSub = "Newer";

  if (beforeYear !== null && afterYear !== null) {
    beforeSub = `Older than ${beforeYear}`;
    correctSub = `${beforeYear} – ${afterYear}`;
    afterSub = `Newer than ${afterYear}`;
  } else if (afterYear !== null) {
    beforeSub = `Older than ${afterYear}`;
    correctSub = `Before ${afterYear}`;
    afterSub = `Newer than ${afterYear}`;
  } else if (beforeYear !== null) {
    beforeSub = `Older than ${beforeYear}`;
    correctSub = `After ${beforeYear}`;
    afterSub = `Newer than ${beforeYear}`;
  }

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

      {/* Decision Reference Timeline */}
      <div className="pointer-events-none opacity-95">
        <p className="text-xs font-black uppercase tracking-wider text-white/45 mb-2 pl-1">
          {currentPlayer.name}&apos;s locked timeline reference
        </p>
        <Timeline
          timeline={currentPlayer.timeline}
          selectedInsertionIndex={selectedIndex}
          onSelectInsertion={() => {}}
        />
      </div>

      {/* Decision Context Card */}
      <section className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-4 shadow-xl">
        <p className="text-xs font-black uppercase tracking-wider text-brand-500 text-center">Selected Timeline Slot</p>
        <div className="flex flex-col sm:flex-row items-stretch justify-between gap-4 text-center sm:text-left">
          <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5 w-full flex flex-col justify-center">
            <span className="block text-[10px] uppercase text-white/40 font-bold tracking-wider mb-1">Before Year</span>
            <span className="font-black text-white text-sm line-clamp-2">
              {previousTrack ? `${previousTrack.releaseYear} — ${previousTrack.title}` : "Beginning of Time"}
            </span>
          </div>
          <div className="flex items-center justify-center p-2 bg-brand-500/10 text-brand-500 rounded-full ring-1 ring-brand-500/25 font-black text-[10px] uppercase tracking-widest px-4 py-2 shrink-0 self-center">
            🔒 Locked Spot
          </div>
          <div className="flex-1 p-3 rounded-xl bg-white/5 border border-white/5 w-full text-center sm:text-right flex flex-col justify-center">
            <span className="block text-[10px] uppercase text-white/40 font-bold tracking-wider mb-1">After Year</span>
            <span className="font-black text-white text-sm line-clamp-2">
              {nextTrack ? `${nextTrack.releaseYear} — ${nextTrack.title}` : "Present Day"}
            </span>
          </div>
        </div>
      </section>

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
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all ${
                    currentVote === "before"
                      ? "bg-brand-500 border-brand-500 text-white shadow-glow"
                      : "bg-ink border-white/15 text-white/65 hover:border-white/30"
                  }`}
                >
                  <ArrowLeft className="h-4 w-4 mb-1" />
                  <span className="text-xs font-black">Before</span>
                  <span className="text-[10px] font-bold opacity-60 mt-0.5">{beforeSub}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVote(challenger.id, "correct")}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all ${
                    currentVote === "correct"
                      ? "bg-brand-500 border-brand-500 text-white shadow-glow"
                      : "bg-ink border-white/15 text-white/65 hover:border-white/30"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4 mb-1" />
                  <span className="text-xs font-black">Spot On</span>
                  <span className="text-[10px] font-bold opacity-60 mt-0.5">{correctSub}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVote(challenger.id, "after")}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all ${
                    currentVote === "after"
                      ? "bg-brand-500 border-brand-500 text-white shadow-glow"
                      : "bg-ink border-white/15 text-white/65 hover:border-white/30"
                  }`}
                >
                  <ArrowRight className="h-4 w-4 mb-1" />
                  <span className="text-xs font-black">After</span>
                  <span className="text-[10px] font-bold opacity-60 mt-0.5">{afterSub}</span>
                </button>
              </div>
            </div>
          );
        })}
      </section>

      <div className="mt-4">
        <button
          type="button"
          disabled={!allVoted}
          className={`w-full min-h-12 inline-flex items-center justify-center rounded-xl font-bold tracking-widest uppercase transition-all border ${
            allVoted 
              ? "bg-brand-500 text-white border-white/20 shadow-lg shadow-brand-500/25 hover:bg-brand-400 cursor-pointer" 
              : "bg-white/5 text-white/30 border-white/5 cursor-not-allowed"
          }`}
          onClick={() => onSubmit(votes)}
        >
          {allVoted ? "Submit Challenge & Reveal" : "All Players Must Vote!"}
        </button>
      </div>
    </main>
  );
}
