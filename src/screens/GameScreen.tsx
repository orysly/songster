import { Check, SkipForward } from "lucide-react";
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
  onLockPlacement: () => void;
  onSelectInsertion: (index: number) => void;
  onSkipTrack: () => void;
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
  onClearPlaybackError
}: Props) {
  const selected = state.turn.selectedInsertionIndex;
  const canLock = selected !== null && state.turn.currentTrack !== null;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 pb-safe-bottom pt-safe-top text-white">
      <header className="pt-4">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-mint">Round {state.turn.roundNumber}</p>
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
      <div className="sticky bottom-0 -mx-4 grid grid-cols-2 gap-2 bg-gradient-to-t from-ink via-ink to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8">
        <Button variant="ghost" icon={<SkipForward className="h-5 w-5" />} onClick={onSkipTrack}>
          Skip track
        </Button>
        <Button disabled={!canLock} icon={<Check className="h-5 w-5" />} onClick={onLockPlacement}>
          Lock placement
        </Button>
      </div>
    </main>
  );
}
