import type { Track } from "../types/game";
import type { SpotifyPlaylistTrackItem } from "../types/spotify";

export function extractSpotifyPlaylistId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  const uriMatch = value.match(/^spotify:playlist:([A-Za-z0-9]+)$/);
  if (uriMatch) return uriMatch[1];

  try {
    const url = new URL(value);
    if (url.hostname === "open.spotify.com") {
      const [, type, id] = url.pathname.split("/");
      if (type === "playlist" && id) return id;
    }
  } catch {
    return null;
  }

  return null;
}

export function getReleaseYear(releaseDate: string): number | null {
  const match = releaseDate.match(/^(\d{4})(?:-\d{2})?(?:-\d{2})?$/);
  if (!match) return null;
  const year = Number(match[1]);
  const currentYear = new Date().getFullYear() + 1;
  if (!Number.isInteger(year) || year < 1860 || year > currentYear) return null;
  return year;
}

export function normalizeSpotifyTrack(item: SpotifyPlaylistTrackItem): Track | null {
  const source = item.track;
  if (!source) return null;
  if (source.type && source.type !== "track") return null;
  if (source.is_local) return null;
  if (source.is_playable === false) return null;
  if (!source.id || !source.uri || !source.duration_ms) return null;

  const releaseDate = source.album?.release_date;
  if (!releaseDate) return null;
  const releaseYear = getReleaseYear(releaseDate);
  if (!releaseYear) return null;

  const artists = source.artists?.map((artist) => artist.name).filter(Boolean) ?? [];
  if (artists.length === 0) return null;

  const artworkUrl = source.album?.images?.[0]?.url;

  return {
    id: source.id,
    title: source.name,
    artists,
    album: source.album?.name,
    releaseDate,
    releaseYear,
    durationMs: source.duration_ms,
    spotifyUri: source.uri,
    spotifyUrl: source.external_urls?.spotify ?? `https://open.spotify.com/track/${source.id}`,
    artworkUrl,
    previewUrl: source.preview_url ?? null
  };
}

export function dedupeTracks(tracks: Track[]): Track[] {
  const seen = new Set<string>();
  return tracks.filter((track) => {
    if (seen.has(track.id)) return false;
    seen.add(track.id);
    return true;
  });
}
