import { clearAuthScratch, clearTokenSet, loadAuthScratch, loadTokenSet, saveAuthScratch, saveTokenSet } from "./storage";
import type { SpotifyTokenSet } from "../types/spotify";

const AUTH_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const PUBLIC_SPOTIFY_CLIENT_ID_FALLBACK = "7fbc1305aac84d3f8da3b9ccfa196e3a";
let redirectCompletionPromise: Promise<SpotifyTokenSet | null> | null = null;

export const SPOTIFY_SCOPES = [
  "streaming",
  "user-read-private",
  "user-read-email",
  "user-read-playback-state",
  "user-modify-playback-state",
  "playlist-read-private",
  "playlist-read-collaborative"
];

export function getSpotifyConfig(): { clientId: string; redirectUri: string; configured: boolean } {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || PUBLIC_SPOTIFY_CLIENT_ID_FALLBACK;
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI ?? window.location.origin + "/";
  return { clientId, redirectUri, configured: Boolean(clientId && redirectUri) };
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function randomString(length: number): string {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (value) => possible[value % possible.length]).join("");
}

async function sha256(value: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
}

export async function beginSpotifyLogin(): Promise<void> {
  const { clientId, redirectUri, configured } = getSpotifyConfig();
  if (!configured) throw new Error("Spotify client ID is missing.");

  clearTokenSet();
  clearAuthScratch();

  const verifier = randomString(96);
  const state = randomString(24);
  const challenge = base64UrlEncode(await sha256(verifier));
  saveAuthScratch({ verifier, state });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: SPOTIFY_SCOPES.join(" "),
    redirect_uri: redirectUri,
    state,
    code_challenge_method: "S256",
    code_challenge: challenge,
    show_dialog: "true"
  });

  window.location.assign(`${AUTH_URL}?${params.toString()}`);
}

async function exchangeSpotifyCode(code: string, state: string | null): Promise<SpotifyTokenSet> {
  const scratch = loadAuthScratch();
  const { clientId, redirectUri } = getSpotifyConfig();
  if (!scratch?.verifier || scratch.state !== state) throw new Error("Spotify sign-in state did not match.");

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: scratch.verifier
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify token exchange failed${text ? `: ${text}` : "."}`);
  }
  const data = (await response.json()) as { access_token: string; refresh_token?: string; expires_in: number };
  const tokenSet = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000 - 30_000
  };
  saveTokenSet(tokenSet);
  clearAuthScratch();
  window.history.replaceState({}, document.title, window.location.pathname);
  return tokenSet;
}

export function completeSpotifyRedirect(): Promise<SpotifyTokenSet | null> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");
  const error = params.get("error");
  if (error) throw new Error(`Spotify sign-in failed: ${error}`);
  if (!code) return Promise.resolve(null);
  redirectCompletionPromise ??= exchangeSpotifyCode(code, state);
  return redirectCompletionPromise;
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokenSet = loadTokenSet();
  if (!tokenSet) return null;
  if (tokenSet.expiresAt > Date.now()) return tokenSet.accessToken;
  if (!tokenSet.refreshToken) return null;
  return refreshSpotifyToken(tokenSet.refreshToken);
}

export async function refreshSpotifyToken(refreshToken: string): Promise<string | null> {
  const { clientId } = getSpotifyConfig();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { access_token: string; refresh_token?: string; expires_in: number };
  const tokenSet = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000 - 30_000
  };
  saveTokenSet(tokenSet);
  return tokenSet.accessToken;
}

export function disconnectSpotify(): void {
  clearTokenSet();
  clearAuthScratch();
}
