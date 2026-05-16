import type { GameSettings, Player, PlaylistMeta, Track } from "../types/game";
import type { SpotifyAuthStatus } from "../types/spotify";
import { Button } from "../components/shared/Button";
import { ErrorBanner } from "../components/shared/ErrorBanner";
import { GameSettingsPanel } from "../components/setup/GameSettingsPanel";
import { InstallPwaHint } from "../components/pwa/InstallPwaHint";
import { PlaylistInput } from "../components/setup/PlaylistInput";
import { PlaylistSummary } from "../components/setup/PlaylistSummary";
import { PlayerSetup } from "../components/setup/PlayerSetup";
import { SpotifyConnectButton } from "../components/setup/SpotifyConnectButton";
import { Logo } from "../components/shared/Logo";
import { BRAND } from "../config/brand";

type Props = {
  spotifyStatus: SpotifyAuthStatus;
  spotifyConfigured: boolean;
  spotifyError: string | null;
  playlistError: string | null;
  playlistLoading: boolean;
  playlist: PlaylistMeta | null;
  players: Player[];
  settings: GameSettings;
  canStart: boolean;
  onConnectSpotify: () => void;
  onDisconnectSpotify: () => void;
  onLoadPlaylist: (input: string) => Promise<void>;
  onLoadDeveloperTracks: () => void;
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
  playlist,
  players,
  settings,
  canStart,
  onConnectSpotify,
  onDisconnectSpotify,
  onLoadPlaylist,
  onLoadDeveloperTracks,
  onAddPlayer,
  onEditPlayer,
  onRemovePlayer,
  onSettingsChange,
  onStart
}: Props) {
  const realStartReady = canStart && spotifyStatus === "connected";
  const developerReady = playlist?.id === "developer-fallback" && players.length >= 2;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-safe-bottom pt-safe-top">
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
      <PlaylistInput
        loading={playlistLoading}
        disabled={spotifyStatus !== "connected"}
        showDeveloperFallback={!spotifyConfigured}
        onLoad={onLoadPlaylist}
        onDeveloperLoad={onLoadDeveloperTracks}
      />
      <PlaylistSummary playlist={playlist} />
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
