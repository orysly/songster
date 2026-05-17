import type { GameSettings, Player, PlaylistMeta, Track } from "../types/game";
import type { SpotifyAuthStatus, UserPlaylistOption } from "../types/spotify";
import { Button } from "../components/shared/Button";
import { ErrorBanner } from "../components/shared/ErrorBanner";
import { GameSettingsPanel } from "../components/setup/GameSettingsPanel";
import { InstallPwaHint } from "../components/pwa/InstallPwaHint";
import { PlaylistInput } from "../components/setup/PlaylistInput";
import { PlaylistSummary } from "../components/setup/PlaylistSummary";
import { PlayerSetup } from "../components/setup/PlayerSetup";
import { SpotifyConnectButton } from "../components/setup/SpotifyConnectButton";
import { BuiltInCollections } from "../components/setup/BuiltInCollections";
import { Logo } from "../components/shared/Logo";
import { BRAND } from "../config/brand";
import React from "react";
import type { Era, Genre } from "../data/builtinPlaylists";
import { AdminScreen } from "./AdminScreen";

type Props = {
  spotifyStatus: SpotifyAuthStatus;
  spotifyConfigured: boolean;
  spotifyError: string | null;
  playlistError: string | null;
  playlistLoading: boolean;
  userPlaylistsLoading: boolean;
  userPlaylists: UserPlaylistOption[];
  playlists: PlaylistMeta[];
  players: Player[];
  settings: GameSettings;
  canStart: boolean;
  onConnectSpotify: () => void;
  onDisconnectSpotify: () => void;
  onLoadPlaylist: (input: string) => Promise<void>;
  onLoadPlaylistById: (playlistId: string) => Promise<void>;
  onLoadBuiltInSearch: (eras: Era[], genres: Genre[]) => Promise<void>;
  onLoadUserPlaylists: () => Promise<void>;
  onLoadDeveloperTracks: () => void;
  onRemovePlaylist: (playlistId: string) => void;
  onAddPlayer: (name: string) => void;
  onEditPlayer: (id: string, name: string) => void;
  onRemovePlayer: (id: string) => void;
  onSettingsChange: (settings: Partial<GameSettings>) => void;
  onStart: () => void;
};

export function SetupScreen({
  spotifyStatus,
  spotifyConfigured,
  spotifyError,
  playlistError,
  playlistLoading,
  userPlaylistsLoading,
  userPlaylists,
  playlists,
  players,
  settings,
  canStart,
  onConnectSpotify,
  onDisconnectSpotify,
  onLoadPlaylist,
  onLoadPlaylistById,
  onLoadBuiltInSearch,
  onLoadUserPlaylists,
  onLoadDeveloperTracks,
  onRemovePlaylist,
  onAddPlayer,
  onEditPlayer,
  onRemovePlayer,
  onSettingsChange,
  onStart
}: Props) {
  const [isAdmin, setIsAdmin] = React.useState(false);

  if (isAdmin) {
    return <AdminScreen onBack={() => setIsAdmin(false)} />;
  }
  const realStartReady = canStart && spotifyStatus === "connected";
  const developerReady = playlists.some((playlist) => playlist.id === "developer-fallback") && players.length >= 2;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-safe-bottom pt-safe-top relative">
      <button 
        onClick={() => setIsAdmin(true)}
        className="absolute top-6 right-4 text-xs font-mono text-white/20 hover:text-white/80 transition-colors z-50"
      >
        [dev]
      </button>

      <section className="pt-6 text-white">
        <Logo />
        <h1 className="mt-5 text-5xl font-black leading-none">{BRAND.productName}</h1>
        <p className="mt-4 text-lg leading-7 text-white/72">
          Connect Spotify, load a playlist, and place mystery songs into each player&apos;s release-year timeline.
        </p>
      </section>

      <ErrorBanner message={spotifyError ?? playlistError} />
      <SpotifyConnectButton
        status={spotifyStatus}
        configured={spotifyConfigured}
        onConnect={onConnectSpotify}
        onDisconnect={onDisconnectSpotify}
      />
      <BuiltInCollections
        disabled={spotifyStatus !== "connected"}
        loading={playlistLoading}
        onLoadSearch={onLoadBuiltInSearch}
      />
      
      <div className="flex items-center gap-4 py-2">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-sm font-bold uppercase tracking-wider text-white/30">Or custom</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <PlaylistInput
        loading={playlistLoading}
        loadingUserPlaylists={userPlaylistsLoading}
        disabled={spotifyStatus !== "connected"}
        userPlaylists={userPlaylists}
        showDeveloperFallback={!spotifyConfigured}
        onLoad={onLoadPlaylist}
        onLoadById={onLoadPlaylistById}
        onLoadUserPlaylists={onLoadUserPlaylists}
        onDeveloperLoad={onLoadDeveloperTracks}
      />
      <PlaylistSummary playlists={playlists} onRemovePlaylist={onRemovePlaylist} />
      <PlayerSetup players={players} onAdd={onAddPlayer} onEdit={onEditPlayer} onRemove={onRemovePlayer} />
      <GameSettingsPanel settings={settings} onChange={onSettingsChange} />
      <InstallPwaHint />

      <div className="sticky bottom-0 -mx-4 bg-gradient-to-t from-ink via-ink to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8">
        <Button className="w-full" disabled={!realStartReady && !developerReady} onClick={onStart}>
          Start game
        </Button>
        {!realStartReady && !developerReady ? (
          <p className="mt-2 text-center text-sm text-white/55">
            Connect Spotify, load 10+ songs, and add at least two players.
          </p>
        ) : null}
      </div>
    </main>
  );
}
