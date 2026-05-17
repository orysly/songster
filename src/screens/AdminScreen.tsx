import { useState } from "react";
import { ALL_ERAS, ALL_GENRES, generateSearchQueries, isYearInEras } from "../data/builtinPlaylists";
import { useSpotifyAuth } from "../hooks/useSpotifyAuth";
import { fetchOriginalReleaseDate, loadDynamicSearch } from "../services/spotifyApi";
import { searchItunesReleaseDate } from "../services/itunesApi";
import { cacheVerifiedTracks, fetchCachedTracks } from "../services/supabaseClient";
import type { Track } from "../types/game";

export function AdminScreen({ onBack }: { onBack: () => void }) {
  const spotify = useSpotifyAuth();
  const [progress, setProgress] = useState<string>("Ready to build database.");
  const [isRunning, setIsRunning] = useState(false);

  async function startScraping() {
    setIsRunning(true);
    const token = spotify.accessToken ?? (await spotify.refreshToken());
    if (!token) {
      setProgress("Failed to get Spotify token.");
      setIsRunning(false);
      return;
    }

    setProgress("Starting massive database build...");
    
    // We iterate through every single combination of Era and Genre!
    for (const era of ALL_ERAS) {
      for (const genre of ALL_GENRES) {
        try {
          setProgress(`Checking cache for: ${era} ${genre}...`);
          
          // Check if it's already built
          const cachedTracks = await fetchCachedTracks([era], [genre]);
          if (cachedTracks.length >= 50) {
            setProgress(`Skipping ${era} ${genre} (already has ${cachedTracks.length} tracks).`);
            continue;
          }

          setProgress(`Generating ${era} ${genre}... fetching from Spotify...`);
          const searchQueries = generateSearchQueries([era], [genre]);
          
          const resultsWithMeta = await Promise.all(
            searchQueries.map(async (sq) => {
              const res = await loadDynamicSearch(sq.query, token);
              return { res, era: sq.era, genre: sq.genre };
            })
          );

          const rawTracksWithMeta = resultsWithMeta
            .flatMap(r => r.res ? r.res.tracks.map(t => ({ track: t, era: r.era, genre: r.genre })) : [])
            .filter((item, index, self) => self.findIndex(t => t.track.id === item.track.id) === index);
            
          rawTracksWithMeta.sort(() => Math.random() - 0.5);

          const validTracksWithMeta: { track: Track; era: typeof era; genre: typeof genre }[] = [];
          const CHUNK_SIZE = 5;

          setProgress(`Verifying ${rawTracksWithMeta.length} raw tracks for ${era} ${genre}...`);

          for (let i = 0; i < rawTracksWithMeta.length && validTracksWithMeta.length < 50; i += CHUNK_SIZE) {
            const chunk = rawTracksWithMeta.slice(i, i + CHUNK_SIZE);
            const verifiedChunk = await Promise.all(
              chunk.map(async (item) => {
                const { track } = item;
                let result = null;
                try {
                  result = await searchItunesReleaseDate(track.title, track.artists[0] ?? "");
                } catch (e) {}

                try {
                  if (!result && track.isrc) {
                    result = await fetchOriginalReleaseDate(track.isrc, token);
                  }
                  if (result) {
                    const year = result.releaseYear;
                    if (isYearInEras(year, [era])) {
                      return { ...item, track: { ...track, releaseDate: result.releaseDate, releaseYear: year, isOriginalDateResolved: true } };
                    }
                    return null;
                  }
                  if (isYearInEras(track.releaseYear, [era])) return item;
                  return null;
                } catch (e) {
                  if (isYearInEras(track.releaseYear, [era])) return item;
                  return null;
                }
              })
            );

            for (const verifiedItem of verifiedChunk) {
              if (verifiedItem && validTracksWithMeta.length < 50) {
                validTracksWithMeta.push(verifiedItem);
              }
            }
            
            if (validTracksWithMeta.length < 50) {
              await new Promise(r => setTimeout(r, 600)); // iTunes rate limit protection
            }
          }

          if (validTracksWithMeta.length > 0) {
            setProgress(`Saving ${validTracksWithMeta.length} verified tracks for ${era} ${genre} to Supabase...`);
            await cacheVerifiedTracks(validTracksWithMeta);
          } else {
            setProgress(`Failed to find any valid tracks for ${era} ${genre}!`);
          }

          // Wait before hitting the next genre to be safe
          await new Promise(r => setTimeout(r, 2000));
          
        } catch (error) {
          console.error(`Error processing ${era} ${genre}`, error);
          setProgress(`Error processing ${era} ${genre}. Check console.`);
        }
      }
    }

    setProgress("DATABASE BUILD COMPLETE! All 66 combinations processed!");
    setIsRunning(false);
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center">
      <h2 className="mb-6 text-3xl font-black uppercase tracking-tight text-white">Database Builder</h2>
      <p className="mb-8 max-w-md text-white/60">
        This tool automatically loops through all {ALL_ERAS.length * ALL_GENRES.length} Era/Genre combinations, 
        generates the tracks, verifies them against iTunes, and saves them to your Supabase database.
      </p>
      
      <div className="mb-8 w-full max-w-md rounded-xl bg-white/5 p-4 text-left font-mono text-sm text-green-400 shadow-inner">
        {progress}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="rounded-full bg-white/10 px-8 py-4 font-bold text-white transition hover:bg-white/20"
        >
          Back
        </button>
        <button
          onClick={startScraping}
          disabled={isRunning}
          className="rounded-full bg-green-500 px-8 py-4 font-bold text-ink transition hover:scale-105 hover:bg-green-400 disabled:opacity-50"
        >
          {isRunning ? "Building..." : "Start Auto-Builder"}
        </button>
      </div>
    </div>
  );
}
