import type {
  PlaylistImportResult,
  SpotifyPageResponse,
  SpotifyPlaylistResponse,
  SpotifyPlaylistSummary,
  SpotifyPlaylistTrackItem,
  UserPlaylistOption
} from "../types/spotify";
import { dedupeTracks, normalizeSpotifyTrack } from "../utils/spotifyTrack";

const API_BASE = "https://api.spotify.com/v1";

export async function spotifyFetch<T>(
  pathOrUrl: string,
  accessToken: string,
  init: RequestInit = {}
): Promise<T> {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${API_BASE}${pathOrUrl}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init.headers
    }
  });

  if (response.status === 204) return undefined as T;
  if (!response.ok) {
    const text = await response.text();
    if (response.status === 401) {
      throw new Error("Spotify needs a fresh connection. Disconnect and connect Spotify again.");
    }
    if (response.status === 403) {
      throw new Error("Spotify blocked this request. Check that the signed-in account is allowed to use this Spotify app and has Premium.");
    }
    if (response.status === 404 && url.includes("/playlists/")) {
      throw new Error(
        "Spotify could not find that playlist through the Web API. Try a regular public or private playlist from your library instead of a Spotify Mix, Radio, Blend, or other generated playlist."
      );
    }
    throw new Error(text || `Spotify request failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function importPlaylist(playlistId: string, accessToken: string): Promise<PlaylistImportResult> {
  const playlist = await spotifyFetch<SpotifyPlaylistResponse>(
    `/playlists/${playlistId}?fields=id,name`,
    accessToken
  );

  const firstPage = await spotifyFetch<SpotifyPageResponse<SpotifyPlaylistTrackItem>>(
    `/playlists/${playlistId}/tracks?limit=100&fields=items(track(id,name,type,is_local,is_playable,available_markets,uri,duration_ms,preview_url,external_urls,artists(name),album(name,release_date,images))),next,total`,
    accessToken
  );

  const items: SpotifyPlaylistTrackItem[] = [...firstPage.items];
  let next = firstPage.next;
  while (next) {
    const page = await spotifyFetch<SpotifyPageResponse<SpotifyPlaylistTrackItem>>(
      next,
      accessToken
    );
    items.push(...page.items);
    next = page.next;
  }

  const normalized = items.map(normalizeSpotifyTrack);
  const tracks = dedupeTracks(normalized.filter((track) => track !== null));
  return {
    id: playlist.id,
    name: playlist.name,
    tracks,
    skippedCount: items.length - tracks.length
  };
}

export async function listUserPlaylists(accessToken: string): Promise<UserPlaylistOption[]> {
  const items: SpotifyPlaylistSummary[] = [];
  let next: string | null =
    `${API_BASE}/me/playlists?limit=50&fields=items(id,name,tracks(total),owner(display_name)),next,total`;

  while (next) {
    const pageUrl = next;
    const page: SpotifyPageResponse<SpotifyPlaylistSummary> = await spotifyFetch(pageUrl, accessToken);
    items.push(...page.items);
    next = page.next;
  }

  return items.map((playlist) => ({
    id: playlist.id,
    name: playlist.name,
    trackCount: playlist.tracks.total,
    ownerName: playlist.owner?.display_name
  }));
}

export async function transferPlayback(accessToken: string, deviceId: string): Promise<void> {
  await spotifyFetch<void>("/me/player", accessToken, {
    method: "PUT",
    body: JSON.stringify({ device_ids: [deviceId], play: false })
  });
}

export async function startPlayback(
  accessToken: string,
  deviceId: string,
  uri: string,
  positionMs: number
): Promise<void> {
  await spotifyFetch<void>(`/me/player/play?device_id=${encodeURIComponent(deviceId)}`, accessToken, {
    method: "PUT",
    body: JSON.stringify({ uris: [uri], position_ms: positionMs })
  });
}

export async function pausePlayback(accessToken: string): Promise<void> {
  await spotifyFetch<void>("/me/player/pause", accessToken, { method: "PUT" });
}
