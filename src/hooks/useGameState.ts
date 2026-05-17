import { useEffect, useMemo, useState } from "react";
import type { GameSettings, GameState, Player, PlaylistMeta, Track } from "../types/game";
import { fakeTracks } from "../data/fakeTracks";
import { clearGameState, loadGameState, saveGameState } from "../services/storage";
import { getRandomSnippetStartMs, shuffleTracks } from "../utils/deck";
import { calculateRoundScore, getNextPlayerIndex, getWinner } from "../utils/scoring";
import { insertTrackIntoTimeline, isCorrectPlacement } from "../utils/timelineRules";
import { dedupeTracks } from "../utils/spotifyTrack";

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
  doubleOrNothing: false,
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
    playlists: [],
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
    timeline: [createYearMarker(randomStarterYear(deck))],
    hasUsedDoubleOrNothing: false
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
      doubleOrNothing: false,
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
      players: [...current.players, { id: createId("player"), name: trimmed, score: 0, timeline: [], hasUsedDoubleOrNothing: false }]
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

  function addPlaylistTracks(playlist: PlaylistMeta, tracks: Track[]) {
    setState((current) => ({
      ...current,
      playlist,
      playlists: current.playlists.some((candidate) => candidate.id === playlist.id)
        ? current.playlists.map((candidate) => (candidate.id === playlist.id ? { ...playlist, tracks } : candidate))
        : [...current.playlists, { ...playlist, tracks }],
      deck: shuffleTracks(dedupeTracks([...current.deck, ...tracks])),
      originalDeck: dedupeTracks([...current.originalDeck, ...tracks]),
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
        skippedCount: 0,
        tracks: fakeTracks
      },
      playlists: [
        {
          id: "developer-fallback",
          name: "Developer UI fallback",
          usableCount: fakeTracks.length,
          skippedCount: 0,
          tracks: fakeTracks
        }
      ],
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

  function lockPlacement(isDoubleOrNothing = false) {
    setState((current) => {
      const player = current.players[current.turn.currentPlayerIndex];
      const track = current.turn.currentTrack;
      const insertionIndex = current.turn.selectedInsertionIndex;
      if (!player || !track || insertionIndex === null) return current;
      
      const placementCorrect = isCorrectPlacement(player.timeline, track, insertionIndex);
      
      // If double or nothing was used, deduct from the player's one-time use
      const players = current.players.map((p) => {
        if (p.id !== player.id) return p;
        return { ...p, hasUsedDoubleOrNothing: p.hasUsedDoubleOrNothing || isDoubleOrNothing };
      });

      return {
        ...current,
        players,
        phase: "tension", // Transition to tension phase first!
        turn: {
          ...current.turn,
          doubleOrNothing: isDoubleOrNothing,
          placementCorrect,
          artistCorrect: false,
          titleCorrect: false,
          pointsAwarded: 0 // Calculated at reveal
        }
      };
    });
  }

  function revealPlacement() {
    setState((current) => {
      return {
        ...current,
        phase: "reveal",
        turn: {
          ...current.turn,
          pointsAwarded: calculateRoundScore({ 
            placementCorrect: Boolean(current.turn.placementCorrect), 
            artistCorrect: false, 
            titleCorrect: false,
            doubleOrNothing: current.turn.doubleOrNothing
          })
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
            titleCorrect: Boolean(nextTurn.titleCorrect),
            doubleOrNothing: nextTurn.doubleOrNothing
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
        titleCorrect: current.turn.titleCorrect,
        doubleOrNothing: current.turn.doubleOrNothing
      });

      const players = current.players.map((candidate) => {
        if (candidate.id !== player.id) return candidate;
        const newScore = Math.max(0, candidate.score + points); // Prevent negative score if desired, or let it ride. User said "lose 5, 10, 15", we'll allow it to go negative but floor it to 0 just in case it looks weird, actually let's allow negative.
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
    setState((current) => {
      // If skip occurs, deduct 5 points from the current player
      const players = current.players.map((p, index) => {
        if (index !== current.turn.currentPlayerIndex) return p;
        return { ...p, score: p.score - 5 };
      });

      return drawTrack({
        ...current,
        players,
        turn: {
          ...emptyTurn,
          currentPlayerIndex: keepTurn ? current.turn.currentPlayerIndex : getNextPlayerIndex(current.players, current.turn.currentPlayerIndex),
          roundNumber: current.turn.roundNumber
        }
      });
    });
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
      playlists: [],
      deck: [],
      originalDeck: [],
      usedTrackIds: [],
      phase: "setup",
      turn: emptyTurn,
      winnerPlayerId: null
    }));
  }

  function removePlaylist(playlistId: string) {
    setState((current) => {
      const playlists = current.playlists.filter((playlist) => playlist.id !== playlistId);
      const tracks = dedupeTracks(playlists.flatMap((playlist) => playlist.tracks));
      const deck = shuffleTracks(tracks);
      return {
        ...current,
        playlist: playlists.at(-1) ?? null,
        playlists,
        deck,
        originalDeck: tracks,
        usedTrackIds: [],
        phase: playlists.length > 0 ? "ready" : "setup",
        turn: emptyTurn,
        winnerPlayerId: null
      };
    });
  }

  function abortGame() {
    setState((current) => ({
      ...current,
      deck: shuffleTracks(current.originalDeck),
      usedTrackIds: [],
      phase: current.originalDeck.length > 0 ? "ready" : "setup",
      turn: emptyTurn,
      winnerPlayerId: null
    }));
  }

  function updateTrackReleaseDate(trackId: string, releaseDate: string, releaseYear: number) {
    setState((current) => {
      // Update in deck
      const newDeck = current.deck.map(t => 
        t.id === trackId ? { ...t, releaseDate, releaseYear, isOriginalDateResolved: true } : t
      );
      // Update in originalDeck
      const newOriginalDeck = current.originalDeck.map(t => 
        t.id === trackId ? { ...t, releaseDate, releaseYear, isOriginalDateResolved: true } : t
      );
      // Update if it's the current track
      let newTurn = current.turn;
      if (current.turn.currentTrack?.id === trackId) {
        newTurn = {
          ...current.turn,
          currentTrack: {
            ...current.turn.currentTrack,
            releaseDate,
            releaseYear,
            isOriginalDateResolved: true
          }
        };
      }

      return {
        ...current,
        deck: newDeck,
        originalDeck: newOriginalDeck,
        turn: newTurn
      };
    });
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
      addPlaylistTracks,
      loadDeveloperTracks,
      startGame,
      markSnippetPlayed,
      selectInsertion,
      lockPlacement,
      revealPlacement,
      setScoreToggle,
      applyPoints,
      nextPlayer,
      skipTrack,
      playAgainSamePlayers,
      lowerTargetScore,
      newGame,
      changePlaylist,
      abortGame,
      removePlaylist,
      updateTrackReleaseDate
    }
  };
}
