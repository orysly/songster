export type Track = {
  id: string;
  title: string;
  artists: string[];
  album?: string;
  releaseDate: string;
  releaseYear: number;
  durationMs: number;
  spotifyUri: string;
  spotifyUrl: string;
  artworkUrl?: string;
  previewUrl?: string | null;
  isYearMarker?: boolean;
};

export type Player = {
  id: string;
  name: string;
  score: number;
  timeline: Track[];
};

export type GameSettings = {
  targetScore: number;
  snippetSeconds: 15 | 30 | 45;
  allowReplay: boolean;
};

export type GamePhase =
  | "setup"
  | "loadingPlaylist"
  | "ready"
  | "playing"
  | "placementLocked"
  | "reveal"
  | "winner";

export type TurnState = {
  currentPlayerIndex: number;
  roundNumber: number;
  currentTrack: Track | null;
  selectedInsertionIndex: number | null;
  placementCorrect: boolean | null;
  artistCorrect: boolean;
  titleCorrect: boolean;
  pointsAwarded: number;
  snippetStartMs: number | null;
  hasPlayedSnippet: boolean;
  hasAppliedPoints: boolean;
  deckRunOut: boolean;
};

export type PlaylistMeta = {
  id: string;
  name: string;
  usableCount: number;
  skippedCount: number;
  tracks: Track[];
};

export type GameState = {
  players: Player[];
  settings: GameSettings;
  playlist: PlaylistMeta | null;
  playlists: PlaylistMeta[];
  deck: Track[];
  originalDeck: Track[];
  usedTrackIds: string[];
  phase: GamePhase;
  turn: TurnState;
  winnerPlayerId: string | null;
  restoredFromStorage: boolean;
};

export type RoundScoreInput = {
  placementCorrect: boolean;
  artistCorrect: boolean;
  titleCorrect: boolean;
};
