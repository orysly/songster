import { ExternalLink, X } from "lucide-react";
import { ScoreToggle } from "../components/game/ScoreToggle";
import { Button } from "../components/shared/Button";
import type { GameState, Player } from "../types/game";
import { getCorrectInsertionRange, determineChallengeResult } from "../utils/timelineRules";

type Props = {
  state: GameState;
  currentPlayer: Player;
  onToggle: (kind: "artistCorrect" | "titleCorrect", value: boolean) => void;
  onApplyPoints: () => void;
  onNextPlayer: () => void;
  onAbortGame: () => void;
};

export function RevealScreen({ state, currentPlayer, onToggle, onApplyPoints, onNextPlayer, onAbortGame }: Props) {
  const track = state.turn.currentTrack;
  if (!track) return null;
  const placementCorrect = Boolean(state.turn.placementCorrect);
  const correctRange = getCorrectInsertionRange(currentPlayer.timeline, track);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-safe-bottom pt-safe-top text-white">
      <header className="pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/55">Reveal</p>
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold text-white/55 ring-1 ring-white/15"
            onClick={onAbortGame}
          >
            <X className="h-4 w-4" />
            Abort
          </button>
        </div>
        <h1 className="mt-2 text-4xl font-black leading-none">{placementCorrect ? "Nice placement" : "Not this time"}</h1>
      </header>
      <section className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/15">
        <div className="flex items-start gap-4">
          <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-paper text-ink shadow-glow">
            {track.artworkUrl ? (
              <img className="h-full w-full object-cover" src={track.artworkUrl} alt="" />
            ) : (
              <span className="text-sm font-black">No cover</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 inline-flex rounded-xl bg-white px-3 py-1 text-lg font-black text-ink">
              {track.releaseYear}
            </div>
            <h2 className="text-2xl font-black leading-tight">{track.title}</h2>
            <p className="mt-2 text-lg font-bold text-white/80">{track.artists.join(", ")}</p>
            <p className="mt-1 text-sm text-white/60">{track.album}</p>
          </div>
        </div>
        <a
          className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white/10 px-4 font-bold text-white ring-1 ring-white/15"
          href={track.spotifyUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open in Spotify <ExternalLink className="h-4 w-4" />
        </a>
      </section>
      <section className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
        <p className={`text-xl font-black ${placementCorrect ? "text-white" : "text-white/55"}`}>
          Timeline placement: {placementCorrect ? "Correct" : "Incorrect"}
        </p>
        {!placementCorrect && (
          <div className="mt-2 space-y-2 text-sm leading-6 text-white/65">
            <p>
              Correct slot range: position {correctRange.minIndex + 1}
              {correctRange.maxIndex !== correctRange.minIndex ? ` through ${correctRange.maxIndex + 1}` : ""}.
            </p>
          </div>
        )}
        
        <div className="mt-4 space-y-2">
          <ScoreToggle
            label="Artist guessed correctly"
            checked={state.turn.artistCorrect}
            disabled={state.turn.hasAppliedPoints}
            onChange={(value) => onToggle("artistCorrect", value)}
          />
          <ScoreToggle
            label="Song title guessed correctly"
            checked={state.turn.titleCorrect}
            disabled={state.turn.hasAppliedPoints}
            onChange={(value) => onToggle("titleCorrect", value)}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/10 p-3">
            <p className="font-black">{placementCorrect ? 5 : 0}</p>
            <p className="text-xs text-white/55">Timeline</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <p className="font-black">{state.turn.artistCorrect ? 5 : 0}</p>
            <p className="text-xs text-white/55">Artist</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <p className="font-black">{state.turn.titleCorrect ? 5 : 0}</p>
            <p className="text-xs text-white/55">Title</p>
          </div>
        </div>

        {(() => {
          if (!state.turn.doubleOrNothing) return null;

          const incorrectGuesses: string[] = [];
          if (!placementCorrect) incorrectGuesses.push("Timeline Placement");
          if (!state.turn.artistCorrect) incorrectGuesses.push("Artist Name");
          if (!state.turn.titleCorrect) incorrectGuesses.push("Song Title");

          const incorrectCount = incorrectGuesses.length;
          const lostPoints = incorrectCount * 5;

          return (
            <div className="mt-4 rounded-xl bg-brand-500/20 p-4 ring-1 ring-brand-500 shadow-glow">
              <p className="font-black text-brand-500 uppercase tracking-widest text-sm">🔥 Double or Nothing Active 🔥</p>
              {incorrectCount === 0 ? (
                <p className="mt-1 text-sm text-brand-500/90 font-bold">
                  Perfect! You got all 3 right and win +30 points!
                </p>
              ) : (
                <div className="mt-2 text-sm text-brand-500/90 text-left space-y-1">
                  <p className="font-bold text-center">Imperfect guess! You lose points.</p>
                  <p className="text-white/80 mt-1">
                    You missed <span className="font-bold text-brand-500">{incorrectCount}</span> {incorrectCount === 1 ? "guess" : "guesses"}:
                  </p>
                  <ul className="list-disc list-inside text-white/70 text-xs pl-2">
                    {incorrectGuesses.map((g) => (
                      <li key={g}>{g}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-white/60 border-t border-brand-500/20 pt-2 mt-2">
                    Penalty: -5 points per incorrect guess = <span className="font-bold text-brand-500">-{lostPoints} points</span>.
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        <p className={`mt-4 text-center text-5xl font-black ${state.turn.pointsAwarded >= 0 ? "text-white" : "text-brand-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]"}`}>
          {state.turn.pointsAwarded > 0 ? "+" : ""}{state.turn.pointsAwarded}
        </p>
      </section>

      {(() => {
        const challengers = state.players.filter((p) => p.id !== currentPlayer.id);
        if (challengers.length === 0 || Object.keys(state.turn.challenges).length === 0) return null;

        const correctChallengeValue = determineChallengeResult(currentPlayer.timeline, track, state.turn.selectedInsertionIndex ?? 0);
        
        const labelMap = {
          before: "Before (Older)",
          correct: "Spot On",
          after: "After (Newer)"
        };

        return (
          <section className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <h3 className="text-lg font-black text-white mb-2">Challenge Predictions</h3>
            <p className="text-sm text-white/60 mb-4">
              Correct slot prediction: <span className="font-black text-brand-500 uppercase tracking-widest">{labelMap[correctChallengeValue]}</span>
            </p>
            <div className="space-y-2">
              {challengers.map((challenger) => {
                const vote = state.turn.challenges[challenger.id];
                const points = state.turn.challengePointsAwarded[challenger.id] ?? 0;
                const isCorrect = vote === correctChallengeValue;

                return (
                  <div key={challenger.id} className="flex items-center justify-between rounded-xl bg-ink/40 p-3 ring-1 ring-white/5">
                    <div>
                      <p className="font-bold text-sm">{challenger.name}</p>
                      <p className="text-xs text-white/45">Voted: {vote ? labelMap[vote] : "None"}</p>
                    </div>
                    <span className={`font-black text-sm px-3 py-1 rounded-lg ${isCorrect ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/30 shadow-glow shadow-green-500/10 animate-pulse" : "bg-brand-500/20 text-brand-500 ring-1 ring-brand-500/30"}`}>
                      {points >= 0 ? "+" : ""}{points} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })()}

      <div className="sticky bottom-0 -mx-4 bg-gradient-to-t from-ink via-ink to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8">
        {state.turn.hasAppliedPoints ? (
          <Button className="w-full" onClick={onNextPlayer}>
            Next player
          </Button>
        ) : (
          <Button className="w-full" onClick={onApplyPoints}>
            Apply points
          </Button>
        )}
      </div>
    </main>
  );
}
