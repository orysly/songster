import type { Track } from "./game";

export type SpotifyTokenSet = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
};

export type SpotifyAuthStatus =
  | "missingConfig"
  | "disconnected"
  | "connecting"
  | "connected"
  | "expired"
  | "error";

export type SpotifyImage = {
  url: string;
  height: number | null;
  width: number | null;
};

export type SpotifyTrackObject = {
  id: string | null;
  name: string;
  type?: string;
  is_local?: boolean;
  is_playable?: boolean;
  available_markets?: string[];
  uri?: string;
  duration_ms?: number;
  preview_url?: string | null;
  external_urls?: { spotify?: string };
  external_ids?: { isrc?: string };
  artists?: Array<{ name: string }>;
  album?: {
    name?: string;
    release_date?: string;
    images?: SpotifyImage[];
  };
};

export type SpotifyPlaylistTrackItem = {
  track?: SpotifyTrackObject | null;
  item?: SpotifyTrackObject | null;
};

export type SpotifyPlaylistResponse = {
  id: string;
  name: string;
  tracks: {
    items: SpotifyPlaylistTrackItem[];
    next: string | null;
    total: number;
  };
};

export type SpotifyPlaylistSummary = {
  id: string;
  name: string;
  collaborative?: boolean;
  tracks: { total: number };
  owner?: { id?: string; display_name?: string };
};

export type SpotifyCurrentUser = {
  id: string;
  display_name?: string;
};

export type SpotifyPageResponse<T> = {
  items: T[];
  next: string | null;
  total: number;
};

export type PlaylistImportResult = {
  id: string;
  name: string;
  tracks: Track[];
  skippedCount: number;
};

export type UserPlaylistOption = {
  id: string;
  name: string;
  trackCount: number;
  ownerName?: string;
};

export type PlaybackErrorKind =
  | "notConnected"
  | "tokenExpired"
  | "premiumRequired"
  | "deviceNotReady"
  | "transferFailed"
  | "playbackFailed"
  | "trackUnavailable"
  | "iosBlocked"
  | "deckEmpty"
  | "offline";

export type PlaybackError = {
  kind: PlaybackErrorKind;
  message: string;
};

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: {
      Player: new (options: SpotifyPlayerOptions) => SpotifyPlayer;
    };
  }
}

export type SpotifyPlayerOptions = {
  name: string;
  getOAuthToken: (callback: (token: string) => void) => void;
  volume?: number;
};

export type SpotifyPlayer = {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (event: string, callback: (payload: any) => void) => boolean;
  removeListener: (event: string) => boolean;
  pause: () => Promise<void>;
  activateElement?: () => Promise<void>;
};
