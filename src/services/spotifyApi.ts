import type {
  PlaylistImportResult,
  SpotifyCurrentUser,
  SpotifyPageResponse,
  SpotifyPlaylistResponse,
  SpotifyPlaylistSummary,
  SpotifyPlaylistTrackItem,
  UserPlaylistOption,
  SpotifyTrackObject
} from "../types/spotify";
import { dedupeTracks, normalizeSpotifyTrack, getReleaseYear } from "../utils/spotifyTrack";

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
      if (url.includes("/me/player")) {
        throw new Error("Spotify blocked playback. The host account needs Spotify Premium, and playback must be started from a user tap.");
      }
      if (url.includes("/me/playlists") || url.includes("/playlists/")) {
        throw new Error(
          "Spotify blocked playlist access. In Development Mode, Songster can import playlists you own or collaborate on. Copy the songs into one of your own playlists, then load that playlist."
        );
      }
      throw new Error("Spotify blocked this request. Disconnect and connect again, then try once more.");
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
    `/playlists/${playlistId}/items?limit=100&fields=items(item(id,name,type,is_local,is_playable,uri,duration_ms,preview_url,external_urls,external_ids,artists(name),album(name,release_date,images))),next,total`,
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
  const currentUser = await spotifyFetch<SpotifyCurrentUser>("/me?fields=id,display_name", accessToken);
  const items: SpotifyPlaylistSummary[] = [];
  let next: string | null =
    `${API_BASE}/me/playlists?limit=50&fields=items(id,name,collaborative,tracks(total),owner(id,display_name)),next,total`;

  while (next) {
    const pageUrl = next;
    const page: SpotifyPageResponse<SpotifyPlaylistSummary> = await spotifyFetch(pageUrl, accessToken);
    items.push(...page.items);
    next = page.next;
  }

  return items
    .filter((playlist) => playlist.owner?.id === currentUser.id || playlist.collaborative)
    .map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      trackCount: playlist.tracks.total,
      ownerName: playlist.owner?.display_name
    }));
}

export async function loadDynamicSearch(
  query: string,
  accessToken: string
): Promise<PlaylistImportResult | null> {
  try {
    // Spotify lowered the /v1/search limit to 10 in 2026. 
    // We want 50 tracks, but we also want variety from the "Top 150" hits.
    // So we generate all possible offsets up to 140, shuffle them, and pick 5.
    const allTopOffsets = Array.from({ length: 15 }, (_, i) => i * 10);
    const selectedOffsets = allTopOffsets
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    
    const pages = await Promise.all(
      selectedOffsets.map(offset => 
        spotifyFetch<{ tracks: SpotifyPageResponse<SpotifyTrackObject> }>(
          `/search?type=track&q=${encodeURIComponent(query)}&limit=10&offset=${offset}&market=HU`,
          accessToken
        ).catch(() => null) // Ignore out-of-bounds errors on smaller genres
      )
    );

    // Flatten all valid track items from all 5 pages
    const rawItems = pages
      .filter(p => p && p.tracks && p.tracks.items)
      .flatMap(p => p!.tracks.items);

    if (rawItems.length === 0) {
      return null;
    }

    // Map bare SpotifyTrackObject items into the wrapper SpotifyPlaylistTrackItem
    const items = rawItems.map((track) => ({ track } as SpotifyPlaylistTrackItem));
    
    const normalized = items.map(normalizeSpotifyTrack);
    const tracks = dedupeTracks(normalized.filter((track) => track !== null));

    // Just an extra shuffle so the blocks of 10 are completely randomized
    const finalTracks = tracks.sort(() => Math.random() - 0.5);

    return {
      id: `search-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: `Search: ${query}`,
      tracks: finalTracks,
      skippedCount: items.length - finalTracks.length
    };
  } catch (error) {
    console.error("Failed to load dynamic search", error);
    return null;
  }
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

export async function fetchOriginalReleaseDate(isrc: string, accessToken: string): Promise<{ releaseDate: string; releaseYear: number } | null> {
  try {
    const data = await spotifyFetch<{ tracks: SpotifyPageResponse<SpotifyTrackObject> }>(
      `/search?type=track&q=isrc:${isrc}&limit=10`,
      accessToken
    );

    if (!data || !data.tracks || !data.tracks.items || data.tracks.items.length === 0) {
      return null;
    }

    let oldestDateStr: string | null = null;
    let oldestYear: number = 9999;

    for (const item of data.tracks.items) {
      const releaseDate = item.album?.release_date;
      if (!releaseDate) continue;

      const year = getReleaseYear(releaseDate);
      if (year && year < oldestYear) {
        oldestYear = year;
        oldestDateStr = releaseDate;
      }
    }

    if (oldestDateStr && oldestYear !== 9999) {
      return { releaseDate: oldestDateStr, releaseYear: oldestYear };
    }

    return null;
  } catch (err) {
    console.error("Failed to fetch original release date for ISRC:", isrc, err);
    return null;
  }
}

