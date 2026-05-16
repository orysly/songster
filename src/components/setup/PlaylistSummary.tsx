import type { PlaylistMeta } from "../../types/game";

export function PlaylistSummary({ playlists }: { playlists: PlaylistMeta[] }) {
  if (playlists.length === 0) return null;
  const usableCount = playlists.reduce((total, playlist) => total + playlist.usableCount, 0);
  const skippedCount = playlists.reduce((total, playlist) => total + playlist.skippedCount, 0);
  return (
    <div className="rounded-2xl bg-white/10 p-4 text-white ring-1 ring-white/20">
      <p className="text-sm uppercase tracking-wide text-white/55">Playlist pool</p>
      <h3 className="mt-1 text-xl font-black">
        {playlists.length} {playlists.length === 1 ? "playlist" : "playlists"} loaded
      </h3>
      <div className="mt-3 space-y-2">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/10 p-3">
            <span className="min-w-0 flex-1 truncate font-bold">{playlist.name}</span>
            <span className="shrink-0 text-sm text-white/60">{playlist.usableCount} songs</span>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/10 p-3">
          <p className="text-2xl font-black">{usableCount}</p>
          <p className="text-sm text-white/70">usable tracks</p>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <p className="text-2xl font-black">{skippedCount}</p>
          <p className="text-sm text-white/70">skipped</p>
        </div>
      </div>
      {usableCount < 10 ? (
        <p className="mt-3 text-sm text-white/55">Add playlists until there are at least 10 usable songs.</p>
      ) : null}
    </div>
  );
}
