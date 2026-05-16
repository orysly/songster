import { useState } from "react";
import { importPlaylist } from "../services/spotifyApi";
import type { PlaylistImportResult } from "../types/spotify";
import { extractSpotifyPlaylistId } from "../utils/spotifyTrack";

export function useSpotifyPlaylist() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPlaylist(input: string, accessToken: string | null): Promise<PlaylistImportResult | null> {
    setError(null);
    const id = extractSpotifyPlaylistId(input);
    if (!id) {
      setError("Paste a Spotify playlist link or URI.");
      return null;
    }
    if (!accessToken) {
      setError("Connect Spotify before loading the playlist.");
      return null;
    }

    setLoading(true);
    try {
      return await importPlaylist(id, accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Playlist could not be loaded.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, loadPlaylist, clearError: () => setError(null) };
}
