import { useEffect, useState } from "react";
import { ErrorBanner } from "./components/shared/ErrorBanner";
import { useGameState } from "./hooks/useGameState";
import { useSpotifyAuth } from "./hooks/useSpotifyAuth";
import { useSpotifyPlayer } from "./hooks/useSpotifyPlayer";
import { useSpotifyPlaylist } from "./hooks/useSpotifyPlaylist";
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
        skippedCount: result.skippedCount
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
        skippedCount: result.skippedCount
      },
      result.tracks
    );
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
            onLoadUserPlaylists={handleLoadUserPlaylists}
            onLoadDeveloperTracks={game.actions.loadDeveloperTracks}
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
