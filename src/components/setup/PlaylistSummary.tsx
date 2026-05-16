import type { PlaylistMeta } from "../../types/game";

export function PlaylistSummary({ playlist }: { playlist: PlaylistMeta | null }) {
  if (!playlist) return null;
  return (
    <div className="rounded-2xl bg-mint/15 p-4 text-white ring-1 ring-mint/30">
      <p className="text-sm uppercase tracking-wide text-mint">Playlist loaded</p>
      <h3 className="mt-1 text-xl font-black">{playlist.name}</h3>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/10 p-3">
          <p className="text-2xl font-black">{playlist.usableCount}</p>
          <p className="text-sm text-white/70">usable tracks</p>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <p className="text-2xl font-black">{playlist.skippedCount}</p>
          <p className="text-sm text-white/70">skipped</p>
        </div>
      </div>
      {playlist.usableCount < 10 ? (
        <p className="mt-3 text-sm text-coral">Load a playlist with at least 10 usable songs to start.</p>
      ) : null}
    </div>
  );
}
