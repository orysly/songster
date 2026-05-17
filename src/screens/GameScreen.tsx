import { Check, SkipForward, X, Flame } from "lucide-react";
import { MysteryTrackCard } from "../components/game/MysteryTrackCard";
import { Timeline } from "../components/game/Timeline";
import { Button } from "../components/shared/Button";
import { ErrorBanner } from "../components/shared/ErrorBanner";
import { Scoreboard } from "../components/shared/Scoreboard";
import type { GameState, Player } from "../types/game";
import type { PlaybackError } from "../types/spotify";

type Props = {
  state: GameState;
  currentPlayer: Player;
  playbackError: PlaybackError | null;
  isPlaying: boolean;
  onPlay: () => void;
  onLockPlacement: (isDoubleOrNothing?: boolean) => void;
  onSelectInsertion: (index: number) => void;
  onSkipTrack: () => void;
  onAbortGame: () => void;
  onClearPlaybackError: () => void;
};

export function GameScreen({
  state,
  currentPlayer,
  playbackError,
  isPlaying,
  onPlay,
  onLockPlacement,
  onSelectInsertion,
  onSkipTrack,
  onAbortGame,
  onClearPlaybackError
}: Props) {
  const selected = state.turn.selectedInsertionIndex;
  const canLock = selected !== null && state.turn.currentTrack !== null;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 pb-safe-bottom pt-safe-top text-white">
      <header className="pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/55">Round {state.turn.roundNumber}</p>
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold text-white/55 ring-1 ring-white/15"
            onClick={onAbortGame}
          >
            <X className="h-4 w-4" />
            Abort
          </button>
        </div>
        <h1 className="mt-2 text-4xl font-black leading-none">{currentPlayer.name}&apos;s turn</h1>
        <p className="mt-2 text-white/65">{currentPlayer.score} points</p>
      </header>
      <Scoreboard players={state.players} currentPlayerId={currentPlayer.id} />
      <ErrorBanner
        message={playbackError?.message ?? null}
        actionLabel="Try again"
        onAction={onPlay}
        onDismiss={onClearPlaybackError}
      />
      <MysteryTrackCard
        track={state.turn.currentTrack}
        allowReplay={state.settings.allowReplay}
        hasPlayedSnippet={state.turn.hasPlayedSnippet}
        isPlaying={isPlaying}
        onPlay={onPlay}
      />
      <Timeline
        timeline={currentPlayer.timeline}
        selectedInsertionIndex={selected}
        onSelectInsertion={onSelectInsertion}
      />
      <div className="sticky bottom-0 -mx-4 grid gap-3 bg-gradient-to-t from-ink via-ink to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8">
        {!currentPlayer.hasUsedDoubleOrNothing && (
          <Button
            disabled={!canLock}
            className={`w-full min-h-14 justify-center bg-brand-500 font-black tracking-widest uppercase hover:bg-brand-400 shadow-lg shadow-brand-500/20 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] border border-white/20 text-white transition-opacity ${!canLock ? "opacity-50" : "animate-pulse"}`}
            onClick={() => onLockPlacement(true)}
            icon={<Flame className="h-5 w-5" />}
          >
            Double or Nothing!
          </Button>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" icon={<SkipForward className="h-5 w-5" />} onClick={onSkipTrack}>
            Skip (-5 pts)
          </Button>
          <Button disabled={!canLock} icon={<Check className="h-5 w-5" />} onClick={() => onLockPlacement(false)}>
            Lock placement
          </Button>
        </div>
      </div>
    </main>
  );
}
