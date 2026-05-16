import { useState } from "react";
import { importPlaylist, listUserPlaylists } from "../services/spotifyApi";
import type { PlaylistImportResult, UserPlaylistOption } from "../types/spotify";
import { extractSpotifyPlaylistId } from "../utils/spotifyTrack";

export function useSpotifyPlaylist() {
  const [loading, setLoading] = useState(false);
  const [loadingUserPlaylists, setLoadingUserPlaylists] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylistOption[]>([]);

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

  async function loadPlaylistById(playlistId: string, accessToken: string | null): Promise<PlaylistImportResult | null> {
    setError(null);
    if (!playlistId) {
      setError("Choose a playlist first.");
      return null;
    }
    if (!accessToken) {
      setError("Connect Spotify before loading the playlist.");
      return null;
    }

    setLoading(true);
    try {
      return await importPlaylist(playlistId, accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Playlist could not be loaded.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function loadUserPlaylists(accessToken: string | null): Promise<void> {
    setError(null);
    if (!accessToken) {
      setError("Connect Spotify before browsing your playlists.");
      return;
    }

    setLoadingUserPlaylists(true);
    try {
      setUserPlaylists(await listUserPlaylists(accessToken));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your Spotify playlists could not be loaded.");
    } finally {
      setLoadingUserPlaylists(false);
    }
  }

  return {
    loading,
    loadingUserPlaylists,
    error,
    userPlaylists,
    loadPlaylist,
    loadPlaylistById,
    loadUserPlaylists,
    clearError: () => setError(null)
  };
}
