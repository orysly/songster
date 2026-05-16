import { ExternalLink } from "lucide-react";
import { ScoreToggle } from "../components/game/ScoreToggle";
import { Button } from "../components/shared/Button";
import type { GameState, Player } from "../types/game";
import { getCorrectInsertionRange } from "../utils/timelineRules";

type Props = {
  state: GameState;
  currentPlayer: Player;
  onToggle: (kind: "artistCorrect" | "titleCorrect", value: boolean) => void;
  onApplyPoints: () => void;
  onNextPlayer: () => void;
};

export function RevealScreen({ state, currentPlayer, onToggle, onApplyPoints, onNextPlayer }: Props) {
  const track = state.turn.currentTrack;
  if (!track) return null;
  const placementCorrect = Boolean(state.turn.placementCorrect);
  const correctRange = getCorrectInsertionRange(currentPlayer.timeline, track);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-safe-bottom pt-safe-top text-white">
      <header className="pt-4">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-mint">Reveal</p>
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
            <div className="mb-2 inline-flex rounded-xl bg-paper px-3 py-1 text-lg font-black text-ink">
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
        <p className={`text-xl font-black ${placementCorrect ? "text-mint" : "text-coral"}`}>
          Timeline placement: {placementCorrect ? "+5" : "0"}
        </p>
        {!placementCorrect ? (
          <div className="mt-2 space-y-2 text-sm leading-6 text-white/65">
            <p>No points this round because the timeline placement was wrong.</p>
            <p>
              Correct slot range: position {correctRange.minIndex + 1}
              {correctRange.maxIndex !== correctRange.minIndex ? ` through ${correctRange.maxIndex + 1}` : ""}.
            </p>
          </div>
        ) : (
          <>
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
                <p className="font-black">5</p>
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
          </>
        )}
        <p className="mt-4 text-center text-4xl font-black text-lemon">+{state.turn.pointsAwarded}</p>
      </section>
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
