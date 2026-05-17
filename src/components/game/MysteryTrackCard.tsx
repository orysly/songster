import { Disc3, Play, RotateCcw, SkipForward } from "lucide-react";
import type { Track } from "../../types/game";
import { Button } from "../shared/Button";

type Props = {
  track: Track | null;
  allowReplay: boolean;
  hasPlayedSnippet: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onSkipTrack?: () => void;
};

export function MysteryTrackCard({ track, allowReplay, hasPlayedSnippet, isPlaying, onPlay, onSkipTrack }: Props) {
  const replayBlocked = hasPlayedSnippet && !allowReplay;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/12 p-px shadow-glow">
      <div className="rounded-[1.35rem] bg-ink p-6 text-center text-white relative">
        {onSkipTrack && (
          <button
            type="button"
            onClick={onSkipTrack}
            className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-black uppercase tracking-wider text-white/45 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
          >
            <span>Skip (-5 pts)</span>
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full border-4 border-white/15 bg-white/10">
          <Disc3 className="h-12 w-12 animate-spin text-white [animation-duration:7s]" />
        </div>
        <h2 className="text-3xl font-black">Guess the song</h2>
        <Button
          className="mx-auto mt-5 min-w-40"
          disabled={!track || isPlaying || replayBlocked}
          icon={hasPlayedSnippet ? <RotateCcw className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          onClick={onPlay}
        >
          {hasPlayedSnippet ? "Replay" : "Play"}
        </Button>
        {replayBlocked ? <p className="mt-3 text-sm text-white/55">Replay is off for this game.</p> : null}
      </div>
    </div>
  );
}
