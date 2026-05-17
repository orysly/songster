import { createClient } from "@supabase/supabase-js";
import type { Track } from "../types/game";
import type { Era, Genre } from "../data/builtinPlaylists";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function fetchCachedTracks(eras: Era[], genres: Genre[]): Promise<Track[]> {
  if (!supabase) return [];
  
  // We need to fetch tracks that match any of the selected eras AND any of the selected genres.
  // We do two IN filters if array has elements. If array is empty, we don't filter.
  let query = supabase.from("verified_tracks").select("*");
  
  if (eras.length > 0) {
    query = query.in("era", eras);
  }
  if (genres.length > 0) {
    query = query.in("genre", genres);
  }

  const { data, error } = await query;
  if (error || !data) {
    console.error("Failed to fetch cached tracks from Supabase:", error);
    return [];
  }

  // Shuffle the cached tracks and pick up to 50
  const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 50);

  // Map them back to the game's internal Track type
  return shuffled.map((row) => ({
    id: row.spotify_id, // We use the spotify ID as the game track ID
    title: row.title,
    artists: row.artists,
    releaseDate: row.release_date,
    releaseYear: row.release_year,
    durationMs: row.duration_ms,
    previewUrl: row.preview_url,
    artworkUrl: row.image_url,
    isrc: row.isrc,
    spotifyUri: `spotify:track:${row.spotify_id}`,
    spotifyUrl: `https://open.spotify.com/track/${row.spotify_id}`,
    isOriginalDateResolved: true // We know it's resolved because we only cache resolved tracks!
  }));
}

export async function cacheVerifiedTracks(items: { track: Track; era: Era; genre: Genre }[]): Promise<void> {
  if (!supabase) return;

  const records = items.map(item => ({
    spotify_id: item.track.id,
    title: item.track.title,
    artists: item.track.artists,
    release_year: item.track.releaseYear,
    release_date: item.track.releaseDate,
    era: item.era,
    genre: item.genre,
    preview_url: item.track.previewUrl,
    image_url: item.track.artworkUrl,
    duration_ms: item.track.durationMs,
    isrc: item.track.isrc
  }));

  // Upsert to ignore duplicates (since spotify_id is UNIQUE)
  const { error } = await supabase.from("verified_tracks").upsert(records, { onConflict: "spotify_id", ignoreDuplicates: true });
  
  if (error) {
    console.error("Failed to cache tracks to Supabase:", error);
  } else {
    console.log(`Successfully cached ${records.length} verified tracks to Supabase!`);
  }
}
