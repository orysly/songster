import { useEffect, useState } from "react";
import { ErrorBanner } from "./components/shared/ErrorBanner";
import { useGameState } from "./hooks/useGameState";
import { useSpotifyAuth } from "./hooks/useSpotifyAuth";
import { useSpotifyPlayer } from "./hooks/useSpotifyPlayer";
import { useSpotifyPlaylist } from "./hooks/useSpotifyPlaylist";
import { searchItunesReleaseDate } from "./services/itunesApi";
import { fetchOriginalReleaseDate, loadDynamicSearch } from "./services/spotifyApi";
import { generateSearchQueries, isYearInEras, type Era, type Genre } from "./data/builtinPlaylists";
import { GameScreen } from "./screens/GameScreen";
import { RevealScreen } from "./screens/RevealScreen";
import { SetupScreen } from "./screens/SetupScreen";
import { WinnerScreen } from "./screens/WinnerScreen";

export default function App() {
  const game = useGameState();
  const spotify = useSpotifyAuth();
  const playlist = useSpotifyPlaylist();
  const player = useSpotifyPlayer(spotify.status === "connected");
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const markOnline = () => setOffline(false);
    const markOffline = () => setOffline(true);
    window.addEventListener("online", markOnline);
    window.addEventListener("offline", markOffline);
    return () => {
      window.removeEventListener("online", markOnline);
      window.removeEventListener("offline", markOffline);
    };
  }, []);

  async function handleLoadPlaylist(input: string) {
    const token = spotify.accessToken ?? (await spotify.refreshToken());
    const result = await playlist.loadPlaylist(input, token);
    if (!result) return;
    game.actions.addPlaylistTracks(
      {
        id: result.id,
        name: result.name,
        usableCount: result.tracks.length,
        skippedCount: result.skippedCount,
        tracks: result.tracks
      },
      result.tracks
    );
  }

  async function handleLoadPlaylistById(playlistId: string) {
    const token = spotify.accessToken ?? (await spotify.refreshToken());
    const result = await playlist.loadPlaylistById(playlistId, token);
    if (!result) return;
    game.actions.addPlaylistTracks(
      {
        id: result.id,
        name: result.name,
        usableCount: result.tracks.length,
        skippedCount: result.skippedCount,
        tracks: result.tracks
      },
      result.tracks
    );
  }

  async function handleLoadBuiltInSearch(eras: Era[], genres: Genre[]) {
    const token = spotify.accessToken ?? (await spotify.refreshToken());
    if (!token) return;

    const queries = generateSearchQueries(eras, genres);
    
    // Execute all queries in parallel to get a massive pool of raw tracks
    const results = await Promise.all(
      queries.map(q => loadDynamicSearch(q, token))
    );

    // Combine all tracks, remove duplicates
    const rawTracks = results
      .flatMap(r => r ? r.tracks : [])
      .filter((track, index, self) => self.findIndex(t => t.id === track.id) === index);
      
    // Shuffle the raw pool so the iTunes verification hits different songs every time
    rawTracks.sort(() => Math.random() - 0.5);

    const validTracks = [];
    const TARGET_COUNT = 50;
    const CHUNK_SIZE = 5;

    // Process in batches of 5 to avoid iTunes rate limits
    for (let i = 0; i < rawTracks.length && validTracks.length < TARGET_COUNT; i += CHUNK_SIZE) {
      const chunk = rawTracks.slice(i, i + CHUNK_SIZE);
      const verifiedChunk = await Promise.all(
        chunk.map(async (track) => {
          let result = null;
          
          try {
            // Check iTunes first
            result = await searchItunesReleaseDate(track.title, track.artists[0] ?? "");
          } catch (e) {
            console.warn(`iTunes search failed for ${track.title} (likely rate limit), falling back to Spotify ISRC.`);
          }

          try {
            // Fallback to Spotify original release date lookup if iTunes failed or returned nothing
            if (!result && track.isrc) {
              result = await fetchOriginalReleaseDate(track.isrc, token);
            }
            
            // If we found a verified true original release date from either source
            if (result) {
              const year = result.releaseYear;
              // STRICT ERA CHECK: Only allow if it belongs in the selected decades
              if (isYearInEras(year, eras)) {
                return { ...track, releaseDate: result.releaseDate, releaseYear: year, isOriginalDateResolved: true };
              }
              return null; // Silent discard: fell outside selected eras
            }
            
            // If neither API finds it, assume Spotify's default date is correct but still verify era!
            if (isYearInEras(track.releaseYear, eras)) {
              return track;
            }
            return null; // Silent discard
          } catch (e) {
            console.error("Verification failed for", track.title, e);
            // If even Spotify API fails, fallback to strict era check on original data
            if (isYearInEras(track.releaseYear, eras)) {
              return track;
            }
            return null;
          }
        })
      );

      for (const track of verifiedChunk) {
        if (track && validTracks.length < TARGET_COUNT) {
          validTracks.push(track);
        }
      }
      
      // Crucial: Wait 600ms between batches to prevent iTunes 429 Too Many Requests
      if (validTracks.length < TARGET_COUNT) {
        await new Promise(r => setTimeout(r, 600));
      }
    }

    if (validTracks.length > 0) {
      const displayEras = eras.length > 0 ? eras.join(", ") : "All Eras";
      const displayGenres = genres.length > 0 ? genres.join(", ") : "All Genres";
      
      game.actions.addPlaylistTracks(
        {
          id: `curated-${Date.now()}`,
          name: `${displayEras} ${displayGenres}`,
          usableCount: validTracks.length,
          skippedCount: rawTracks.length - validTracks.length,
          tracks: validTracks
        },
        validTracks
      );
    }
  }

  async function handleLoadUserPlaylists() {
    const token = spotify.accessToken ?? (await spotify.refreshToken());
    await playlist.loadUserPlaylists(token);
  }

  async function playSnippet() {
    const track = game.state.turn.currentTrack;
    if (!track) return;
    if (game.state.playlists.some((loadedPlaylist) => loadedPlaylist.id === "developer-fallback")) {
      game.actions.markSnippetPlayed();
      return;
    }
    const played = await player.playSnippet(
      track,
      game.state.turn.snippetStartMs ?? 0,
      game.state.settings.snippetSeconds
    );
    if (played) game.actions.markSnippetPlayed();
  }

  async function lockPlacement() {
    await player.pause();
    game.actions.lockPlacement();
  }

  async function skipTrack() {
    await player.pause();
    game.actions.skipTrack(true);
  }

  async function nextPlayer() {
    await player.pause();
    game.actions.nextPlayer();
  }

  async function abortGame() {
    await player.pause();
    game.actions.abortGame();
  }

  useEffect(() => {
    if (game.state.phase === "winner") void player.pause();
  }, [game.state.phase]);

  useEffect(() => {
    const track = game.state.turn.currentTrack;
    if (game.state.phase === "playing" && track && track.isrc && !track.isOriginalDateResolved) {
      let active = true;
      const resolveDate = async () => {
        try {
          const token = spotify.accessToken ?? (await spotify.refreshToken());
          
          let result = await searchItunesReleaseDate(track.title, track.artists[0] ?? "");
          
          if (!result && token && track.isrc) {
            result = await fetchOriginalReleaseDate(track.isrc, token);
          }
          
          if (active && result) {
            game.actions.updateTrackReleaseDate(track.id, result.releaseDate, result.releaseYear);
          }
        } catch (e) {
          console.error("Failed to resolve original date", e);
        }
      };
      resolveDate();
      return () => {
        active = false;
      };
    }
  }, [game.state.phase, game.state.turn.currentTrack?.id, spotify]);

  const currentPlayer = game.currentPlayer;

  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_28%)]" />
      <div className="relative">
        <div className="mx-auto w-full max-w-4xl px-4 pt-3">
          {offline ? <ErrorBanner message="You are offline. The app shell can open, but Spotify gameplay needs internet." /> : null}
        </div>

        {game.state.phase === "playing" && currentPlayer ? (
          <GameScreen
            state={game.state}
            currentPlayer={currentPlayer}
            playbackError={player.error}
            isPlaying={player.isPlaying}
            onPlay={playSnippet}
            onLockPlacement={lockPlacement}
            onSelectInsertion={game.actions.selectInsertion}
            onSkipTrack={skipTrack}
            onAbortGame={abortGame}
            onClearPlaybackError={player.clearError}
          />
        ) : game.state.phase === "reveal" && currentPlayer ? (
          <RevealScreen
            state={game.state}
            currentPlayer={currentPlayer}
            onToggle={game.actions.setScoreToggle}
            onApplyPoints={game.actions.applyPoints}
            onNextPlayer={nextPlayer}
            onAbortGame={abortGame}
          />
        ) : game.state.phase === "winner" ? (
          <WinnerScreen
            state={game.state}
            winner={game.winner}
            onPlayAgain={game.actions.playAgainSamePlayers}
            onNewGame={game.actions.newGame}
          />
        ) : (
          <SetupScreen
            spotifyStatus={spotify.status}
            spotifyConfigured={spotify.configured}
            spotifyError={spotify.error}
            playlistError={playlist.error}
            playlistLoading={playlist.loading}
            userPlaylistsLoading={playlist.loadingUserPlaylists}
            userPlaylists={playlist.userPlaylists}
            playlists={game.state.playlists}
            players={game.state.players}
            settings={game.state.settings}
            canStart={game.canStart}
            onConnectSpotify={spotify.connect}
            onDisconnectSpotify={spotify.disconnect}
            onLoadPlaylist={handleLoadPlaylist}
            onLoadPlaylistById={handleLoadPlaylistById}
            onLoadBuiltInSearch={handleLoadBuiltInSearch}
            onLoadUserPlaylists={handleLoadUserPlaylists}
            onLoadDeveloperTracks={game.actions.loadDeveloperTracks}
            onRemovePlaylist={game.actions.removePlaylist}
            onAddPlayer={game.actions.addPlayer}
            onEditPlayer={game.actions.editPlayer}
            onRemovePlayer={game.actions.removePlayer}
            onSettingsChange={game.actions.updateSettings}
            onStart={game.actions.startGame}
          />
        )}
      </div>
    </div>
  );
}
