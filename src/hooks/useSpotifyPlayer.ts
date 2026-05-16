import { useCallback, useEffect, useRef, useState } from "react";
import { getValidAccessToken } from "../services/spotifyAuth";
import { pausePlayback, startPlayback, transferPlayback } from "../services/spotifyApi";
import { createSpotifyPlayer } from "../services/spotifyPlayback";
import type { Track } from "../types/game";
import type { PlaybackError, SpotifyPlayer } from "../types/spotify";

type PlayerStatus = "idle" | "loading" | "ready" | "notReady" | "error";

export function useSpotifyPlayer(enabled: boolean) {
  const playerRef = useRef<SpotifyPlayer | null>(null);
  const snippetTimerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<PlaybackError | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const stopTimers = useCallback(() => {
    if (snippetTimerRef.current) window.clearTimeout(snippetTimerRef.current);
    if (countdownRef.current) window.clearInterval(countdownRef.current);
    snippetTimerRef.current = null;
    countdownRef.current = null;
  }, []);

  const pause = useCallback(async () => {
    stopTimers();
    setIsPlaying(false);
    setRemainingSeconds(0);
    const token = await getValidAccessToken();
    if (!token) return;
    try {
      await pausePlayback(token);
    } catch {
      // Pausing is best effort; the UI should keep moving even if Spotify is already idle.
    }
  }, [stopTimers]);

  useEffect(() => {
    if (!enabled || playerRef.current) return;
    let cancelled = false;
    setStatus("loading");
    createSpotifyPlayer(getValidAccessToken, {
      onReady: async (readyDeviceId) => {
        if (cancelled) return;
        setDeviceId(readyDeviceId);
        setStatus("ready");
        const token = await getValidAccessToken();
        if (!token) return;
        try {
          await transferPlayback(token, readyDeviceId);
        } catch {
          setError({
            kind: "transferFailed",
            message: "Spotify found the player, but could not move playback here. Tap Try again."
          });
        }
      },
      onNotReady: () => {
        setStatus("notReady");
        setDeviceId(null);
      },
      onError: (message, kind) => {
        setStatus("error");
        setError({
          kind: kind === "premium" ? "premiumRequired" : kind === "auth" ? "tokenExpired" : "playbackFailed",
          message
        });
      }
    })
      .then((player) => {
        if (cancelled) {
          player.disconnect();
          return;
        }
        playerRef.current = player;
      })
      .catch((err) => {
        setStatus("error");
        setError({
          kind: "deviceNotReady",
          message: err instanceof Error ? err.message : "Spotify player could not start."
        });
      });

    return () => {
      cancelled = true;
      stopTimers();
      playerRef.current?.disconnect();
      playerRef.current = null;
    };
  }, [enabled, stopTimers]);

  const playSnippet = useCallback(
    async (track: Track, startMs: number, snippetSeconds: 15 | 30 | 45) => {
      if (!navigator.onLine) {
        setError({ kind: "offline", message: "You are offline. Spotify needs internet to play." });
        return false;
      }
      if (!deviceId || status !== "ready") {
        setError({ kind: "deviceNotReady", message: "Spotify device is still getting ready." });
        return false;
      }
      const token = await getValidAccessToken();
      if (!token) {
        setError({ kind: "tokenExpired", message: "Spotify needs a fresh connection." });
        return false;
      }
      try {
        await playerRef.current?.activateElement?.();
        await startPlayback(token, deviceId, track.spotifyUri, startMs);
        setError(null);
        setIsPlaying(true);
        setRemainingSeconds(snippetSeconds);
        stopTimers();
        countdownRef.current = window.setInterval(() => {
          setRemainingSeconds((value) => Math.max(0, value - 1));
        }, 1000);
        snippetTimerRef.current = window.setTimeout(() => {
          void pause();
        }, snippetSeconds * 1000);
        return true;
      } catch (err) {
        setIsPlaying(false);
        setError({
          kind: "playbackFailed",
          message:
            err instanceof Error
              ? "Spotify could not play this track. Try again or skip it."
              : "Spotify could not play this track."
        });
        return false;
      }
    },
    [deviceId, pause, status, stopTimers]
  );

  return {
    status,
    deviceId,
    error,
    isPlaying,
    remainingSeconds,
    playSnippet,
    pause,
    clearError: () => setError(null)
  };
}
