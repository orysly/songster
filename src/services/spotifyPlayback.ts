import { BRAND } from "../config/brand";
import type { SpotifyPlayer } from "../types/spotify";

let sdkPromise: Promise<void> | null = null;

export function loadSpotifySdk(): Promise<void> {
  if (window.Spotify) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    window.onSpotifyWebPlaybackSDKReady = () => resolve();
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    script.onerror = () => reject(new Error("Spotify player script could not load."));
    document.body.appendChild(script);
  });

  return sdkPromise;
}

export async function createSpotifyPlayer(
  getToken: () => Promise<string | null>,
  handlers: {
    onReady: (deviceId: string) => void;
    onNotReady: () => void;
    onError: (message: string, kind?: "premium" | "auth" | "playback" | "init") => void;
  }
): Promise<SpotifyPlayer> {
  await loadSpotifySdk();
  if (!window.Spotify) throw new Error("Spotify player unavailable.");

  const player = new window.Spotify.Player({
    name: BRAND.playerName,
    volume: 0.8,
    getOAuthToken: async (callback) => {
      const token = await getToken();
      if (token) callback(token);
    }
  });

  player.addListener("ready", ({ device_id }: { device_id: string }) => handlers.onReady(device_id));
  player.addListener("not_ready", () => handlers.onNotReady());
  player.addListener("initialization_error", ({ message }: { message: string }) =>
    handlers.onError(message, "init")
  );
  player.addListener("authentication_error", ({ message }: { message: string }) =>
    handlers.onError(message, "auth")
  );
  player.addListener("account_error", ({ message }: { message: string }) =>
    handlers.onError(message, "premium")
  );
  player.addListener("playback_error", ({ message }: { message: string }) =>
    handlers.onError(message, "playback")
  );
  player.addListener("autoplay_failed", () =>
    handlers.onError("Tap Play again so iOS can allow audio.", "playback")
  );

  await player.connect();
  return player;
}
