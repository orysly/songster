import { useState } from "react";
import { ListMusic, RefreshCw } from "lucide-react";
import { Button } from "../shared/Button";
import type { UserPlaylistOption } from "../../types/spotify";

type Props = {
  loading: boolean;
  loadingUserPlaylists: boolean;
  disabled: boolean;
  userPlaylists: UserPlaylistOption[];
  onLoad: (value: string) => void;
  onLoadById: (playlistId: string) => void;
  onLoadUserPlaylists: () => void;
  onDeveloperLoad: () => void;
  showDeveloperFallback: boolean;
};

export function PlaylistInput({
  loading,
  loadingUserPlaylists,
  disabled,
  userPlaylists,
  onLoad,
  onLoadById,
  onLoadUserPlaylists,
  onDeveloperLoad,
  showDeveloperFallback
}: Props) {
  const [value, setValue] = useState("");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  return (
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
      <label className="mb-2 block text-sm font-bold text-white" htmlFor="playlist">
        Paste playlist link
      </label>
      <input
        id="playlist"
        className="min-h-12 w-full rounded-xl border border-white/15 bg-ink/70 px-4 text-base text-white outline-none placeholder:text-white/35 focus:border-white"
        placeholder="https://open.spotify.com/playlist/..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Button
        className="mt-3 w-full"
        disabled={disabled || loading}
        icon={<ListMusic className="h-5 w-5" />}
        onClick={() => onLoad(value)}
      >
        {loading ? "Loading playlist..." : "Load playlist"}
      </Button>
      <div className="my-4 h-px bg-white/10" />
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-white">Or choose from Spotify</p>
        <Button
          className="min-h-10 px-3 py-2 text-sm"
          variant="ghost"
          disabled={disabled || loadingUserPlaylists}
          icon={<RefreshCw className="h-4 w-4" />}
          onClick={onLoadUserPlaylists}
        >
          {loadingUserPlaylists ? "Loading..." : "Refresh"}
        </Button>
      </div>
      <select
        className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-ink/70 px-4 text-base text-white outline-none focus:border-white"
        disabled={disabled || userPlaylists.length === 0}
        value={selectedPlaylistId}
        onChange={(event) => setSelectedPlaylistId(event.target.value)}
      >
        <option value="">{userPlaylists.length ? "Select a playlist" : "Refresh to show owned playlists"}</option>
        {userPlaylists.map((playlist) => (
          <option key={playlist.id} value={playlist.id}>
            {playlist.name} ({playlist.trackCount})
          </option>
        ))}
      </select>
      <Button
        className="mt-3 w-full"
        variant="secondary"
        disabled={disabled || loading || !selectedPlaylistId}
        icon={<ListMusic className="h-5 w-5" />}
        onClick={() => onLoadById(selectedPlaylistId)}
      >
        Load selected playlist
      </Button>
      <p className="mt-3 text-sm leading-6 text-white/55">
        Spotify currently allows import from playlists you own or collaborate on. To use another playlist, copy its
        songs into one of your own playlists first.
      </p>
      {showDeveloperFallback ? (
        <Button className="mt-2 w-full" variant="ghost" onClick={onDeveloperLoad}>
          Load developer fallback
        </Button>
      ) : null}
    </div>
  );
}
