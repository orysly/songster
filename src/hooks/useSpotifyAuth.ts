import { useCallback, useEffect, useMemo, useState } from "react";
import {
  beginSpotifyLogin,
  completeSpotifyRedirect,
  disconnectSpotify,
  getSpotifyConfig,
  getValidAccessToken
} from "../services/spotifyAuth";
import { loadTokenSet } from "../services/storage";
import type { SpotifyAuthStatus } from "../types/spotify";

export function useSpotifyAuth() {
  const config = useMemo(() => getSpotifyConfig(), []);
  const [status, setStatus] = useState<SpotifyAuthStatus>(config.configured ? "disconnected" : "missingConfig");
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const refreshToken = useCallback(async () => {
    if (!config.configured) {
      setStatus("missingConfig");
      return null;
    }
    const token = await getValidAccessToken();
    setAccessToken(token);
    setStatus(token ? "connected" : "disconnected");
    return token;
  }, [config.configured]);

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        setStatus(new URLSearchParams(window.location.search).has("code") ? "connecting" : status);
        const redirectToken = await completeSpotifyRedirect();
        const token = redirectToken?.accessToken ?? (await getValidAccessToken());
        if (cancelled) return;
        setAccessToken(token);
        setStatus(token ? "connected" : loadTokenSet() ? "expired" : config.configured ? "disconnected" : "missingConfig");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setError(err instanceof Error ? err.message : "Spotify connection failed.");
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
    // status is intentionally excluded to avoid rerunning during redirect hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.configured]);

  const connect = useCallback(async () => {
    setError(null);
    setStatus("connecting");
    try {
      await beginSpotifyLogin();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Spotify sign-in could not start.");
    }
  }, []);

  const disconnect = useCallback(() => {
    disconnectSpotify();
    setAccessToken(null);
    setStatus(config.configured ? "disconnected" : "missingConfig");
  }, [config.configured]);

  return {
    status,
    error,
    accessToken,
    configured: config.configured,
    connect,
    disconnect,
    refreshToken
  };
}
