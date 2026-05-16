import { useEffect, useMemo, useState } from "react";
import type { GameSettings, GameState, Player, PlaylistMeta, Track } from "../types/game";
import { fakeTracks } from "../data/fakeTracks";
import { clearGameState, loadGameState, saveGameState } from "../services/storage";
import { getRandomSnippetStartMs, shuffleTracks } from "../utils/deck";
import { calculateRoundScore, getNextPlayerIndex, getWinner } from "../utils/scoring";
import { insertTrackIntoTimeline, isCorrectPlacement } from "../utils/timelineRules";

const defaultSettings: GameSettings = {
  targetScore: 100,
  snippetSeconds: 30,
  allowReplay: true
};

const emptyTurn = {
  currentPlayerIndex: 0,
  roundNumber: 1,
  currentTrack: null,
  selectedInsertionIndex: null,
  placementCorrect: null,
  artistCorrect: false,
  titleCorrect: false,
  pointsAwarded: 0,
  snippetStartMs: null,
  hasPlayedSnippet: false,
  hasAppliedPoints: false,
  deckRunOut: false
};

function createInitialState(): GameState {
  const stored = loadGameState();
  if (stored) return stored;
  return {
    players: [],
    settings: defaultSettings,
    playlist: null,
    deck: [],
    originalDeck: [],
    usedTrackIds: [],
    phase: "setup",
    turn: emptyTurn,
    winnerPlayerId: null,
    restoredFromStorage: false
  };
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
}

function createYearMarker(year: number): Track {
  return {
    id: createId(`starter-${year}`),
    title: "Starter year",
    artists: ["Timeline anchor"],
    releaseDate: String(year),
    releaseYear: year,
    durationMs: 0,
    spotifyUri: "",
    spotifyUrl: "",
    previewUrl: null,
    isYearMarker: true
  };
}

function randomStarterYear(deck: Track[]): number {
  const years = deck.map((track) => track.releaseYear).filter((year) => Number.isFinite(year));
  if (years.length === 0) return 2000;
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  return Math.floor(minYear + Math.random() * (maxYear - minYear + 1));
}

function resetPlayersWithStarterYears(players: Player[], deck: Track[]): Player[] {
  return players.map((player) => ({
    ...player,
    score: 0,
    timeline: [createYearMarker(randomStarterYear(deck))]
  }));
}

function drawTrack(state: GameState): GameState {
  const [currentTrack, ...remainingDeck] = state.deck;
  if (!currentTrack) {
    return {
      ...state,
      phase: "winner",
      turn: { ...state.turn, currentTrack: null, deckRunOut: true },
      winnerPlayerId: null
    };
  }

  return {
    ...state,
    deck: remainingDeck,
    usedTrackIds: [...state.usedTrackIds, currentTrack.id],
    phase: "playing",
    turn: {
      ...state.turn,
      currentTrack,
      selectedInsertionIndex: null,
      placementCorrect: null,
      artistCorrect: false,
      titleCorrect: false,
      pointsAwarded: 0,
      snippetStartMs: getRandomSnippetStartMs(currentTrack.durationMs, state.settings.snippetSeconds),
      hasPlayedSnippet: false,
      hasAppliedPoints: false,
      deckRunOut: false
    }
  };
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => createInitialState());

  useEffect(() => {
    saveGameState({ ...state, restoredFromStorage: false });
  }, [state]);

  const currentPlayer = state.players[state.turn.currentPlayerIndex] ?? null;
  const canStart = state.players.length >= 2 && state.deck.length >= 10;
  const winner = useMemo(
    () => state.players.find((player) => player.id === state.winnerPlayerId) ?? null,
    [state.players, state.winnerPlayerId]
  );

  function addPlayer(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState((current) => ({
      ...current,
      players: [...current.players, { id: createId("player"), name: trimmed, score: 0, timeline: [] }]
    }));
  }

  function editPlayer(id: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState((current) => ({
      ...current,
      players: current.players.map((player) => (player.id === id ? { ...player, name: trimmed } : player))
    }));
  }

  function removePlayer(id: string) {
    setState((current) => ({
      ...current,
      players: current.players.filter((player) => player.id !== id)
    }));
  }

  function updateSettings(settings: Partial<GameSettings>) {
    setState((current) => ({ ...current, settings: { ...current.settings, ...settings } }));
  }

  function loadTracks(playlist: PlaylistMeta, tracks: Track[]) {
    const deck = shuffleTracks(tracks);
    setState((current) => ({
      ...current,
      playlist,
      deck,
      originalDeck: deck,
      usedTrackIds: [],
      phase: "ready",
      turn: { ...emptyTurn, currentPlayerIndex: current.turn.currentPlayerIndex }
    }));
  }

  function loadDeveloperTracks() {
    const deck = shuffleTracks(fakeTracks);
    setState((current) => ({
      ...current,
      playlist: {
        id: "developer-fallback",
        name: "Developer UI fallback",
        usableCount: fakeTracks.length,
        skippedCount: 0
      },
      deck,
      originalDeck: deck,
      usedTrackIds: [],
      phase: "ready",
      turn: { ...emptyTurn, currentPlayerIndex: current.turn.currentPlayerIndex }
    }));
  }

  function startGame() {
    setState((current) =>
      drawTrack({
        ...current,
        players: resetPlayersWithStarterYears(current.players, current.deck),
        phase: "playing",
        turn: emptyTurn
      })
    );
  }

  function markSnippetPlayed() {
    setState((current) => ({
      ...current,
      turn: { ...current.turn, hasPlayedSnippet: true }
    }));
  }

  function selectInsertion(index: number) {
    setState((current) => ({
      ...current,
      turn: { ...current.turn, selectedInsertionIndex: index }
    }));
  }

  function lockPlacement() {
    setState((current) => {
      const player = current.players[current.turn.currentPlayerIndex];
      const track = current.turn.currentTrack;
      const insertionIndex = current.turn.selectedInsertionIndex;
      if (!player || !track || insertionIndex === null) return current;
      const placementCorrect = isCorrectPlacement(player.timeline, track, insertionIndex);
      return {
        ...current,
        phase: "reveal",
        turn: {
          ...current.turn,
          placementCorrect,
          artistCorrect: false,
          titleCorrect: false,
          pointsAwarded: calculateRoundScore({ placementCorrect, artistCorrect: false, titleCorrect: false })
        }
      };
    });
  }

  function setScoreToggle(kind: "artistCorrect" | "titleCorrect", value: boolean) {
    setState((current) => {
      const placementCorrect = Boolean(current.turn.placementCorrect);
      const nextTurn = {
        ...current.turn,
        [kind]: value
      };
      return {
        ...current,
        turn: {
          ...nextTurn,
          pointsAwarded: calculateRoundScore({
            placementCorrect,
            artistCorrect: Boolean(nextTurn.artistCorrect),
            titleCorrect: Boolean(nextTurn.titleCorrect)
          })
        }
      };
    });
  }

  function applyPoints() {
    setState((current) => {
      if (current.turn.hasAppliedPoints) return current;
      const player = current.players[current.turn.currentPlayerIndex];
      const track = current.turn.currentTrack;
      const insertionIndex = current.turn.selectedInsertionIndex;
      if (!player || !track || insertionIndex === null || current.turn.placementCorrect === null) return current;

      const points = calculateRoundScore({
        placementCorrect: current.turn.placementCorrect,
        artistCorrect: current.turn.artistCorrect,
        titleCorrect: current.turn.titleCorrect
      });

      const players = current.players.map((candidate) => {
        if (candidate.id !== player.id) return candidate;
        return {
          ...candidate,
          score: candidate.score + points,
          timeline: current.turn.placementCorrect
            ? insertTrackIntoTimeline(candidate.timeline, track, insertionIndex)
            : candidate.timeline
        };
      });

      const winnerPlayer = getWinner(players, current.settings.targetScore);
      return {
        ...current,
        players,
        phase: winnerPlayer ? "winner" : current.phase,
        winnerPlayerId: winnerPlayer?.id ?? null,
        turn: { ...current.turn, pointsAwarded: points, hasAppliedPoints: true }
      };
    });
  }

  function nextPlayer() {
    setState((current) => {
      const nextIndex = getNextPlayerIndex(current.players, current.turn.currentPlayerIndex);
      const nextRoundNumber = nextIndex === 0 ? current.turn.roundNumber + 1 : current.turn.roundNumber;
      return drawTrack({
        ...current,
        turn: {
          ...emptyTurn,
          currentPlayerIndex: nextIndex,
          roundNumber: nextRoundNumber
        }
      });
    });
  }

  function skipTrack(keepTurn = true) {
    setState((current) =>
      drawTrack({
        ...current,
        turn: {
          ...emptyTurn,
          currentPlayerIndex: keepTurn ? current.turn.currentPlayerIndex : getNextPlayerIndex(current.players, current.turn.currentPlayerIndex),
          roundNumber: current.turn.roundNumber
        }
      })
    );
  }

  function playAgainSamePlayers() {
    setState((current) =>
      drawTrack({
        ...current,
        players: resetPlayersWithStarterYears(current.players, current.originalDeck),
        deck: shuffleTracks(current.originalDeck),
        usedTrackIds: [],
        phase: "playing",
        winnerPlayerId: null,
        turn: emptyTurn
      })
    );
  }

  function lowerTargetScore() {
    setState((current) => ({
      ...current,
      settings: { ...current.settings, targetScore: Math.max(25, current.settings.targetScore - 25) }
    }));
  }

  function newGame() {
    clearGameState();
    setState(createInitialState());
  }

  function changePlaylist() {
    setState((current) => ({
      ...current,
      playlist: null,
      deck: [],
      originalDeck: [],
      usedTrackIds: [],
      phase: "setup",
      turn: emptyTurn,
      winnerPlayerId: null
    }));
  }

  return {
    state,
    currentPlayer,
    winner,
    canStart,
    actions: {
      addPlayer,
      editPlayer,
      removePlayer,
      updateSettings,
      loadTracks,
      loadDeveloperTracks,
      startGame,
      markSnippetPlayed,
      selectInsertion,
      lockPlacement,
      setScoreToggle,
      applyPoints,
      nextPlayer,
      skipTrack,
      playAgainSamePlayers,
      lowerTargetScore,
      newGame,
      changePlaylist
    }
  };
}
