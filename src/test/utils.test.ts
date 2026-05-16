import { describe, expect, it, vi } from "vitest";
import type { Track } from "../types/game";
import { getRandomSnippetStartMs, shuffleTracks } from "../utils/deck";
import { calculateRoundScore, getNextPlayerIndex, getWinner } from "../utils/scoring";
import {
  getCorrectInsertionRange,
  insertTrackIntoTimeline,
  isCorrectPlacement
} from "../utils/timelineRules";
import { extractSpotifyPlaylistId, getReleaseYear, normalizeSpotifyTrack } from "../utils/spotifyTrack";

function track(id: string, year: number): Track {
  return {
    id,
    title: `Song ${id}`,
    artists: ["Artist"],
    releaseDate: `${year}`,
    releaseYear: year,
    durationMs: 180000,
    spotifyUri: `spotify:track:${id}`,
    spotifyUrl: `https://open.spotify.com/track/${id}`,
    previewUrl: null
  };
}

describe("spotify playlist utilities", () => {
  it("extracts playlist IDs from URL and URI formats", () => {
    expect(extractSpotifyPlaylistId("https://open.spotify.com/playlist/abc123?si=test")).toBe("abc123");
    expect(extractSpotifyPlaylistId("spotify:playlist:def456")).toBe("def456");
    expect(extractSpotifyPlaylistId("https://example.com/playlist/nope")).toBeNull();
  });

  it("parses release years from Spotify date formats", () => {
    expect(getReleaseYear("1997")).toBe(1997);
    expect(getReleaseYear("1997-05")).toBe(1997);
    expect(getReleaseYear("1997-05-12")).toBe(1997);
    expect(getReleaseYear("May 1997")).toBeNull();
  });

  it("normalizes valid Spotify tracks and filters bad items", () => {
    expect(
      normalizeSpotifyTrack({
        track: {
          id: "abc",
          name: "Track",
          type: "track",
          is_local: false,
          is_playable: true,
          uri: "spotify:track:abc",
          duration_ms: 200000,
          external_urls: { spotify: "https://open.spotify.com/track/abc" },
          artists: [{ name: "One" }, { name: "Two" }],
          album: { name: "Album", release_date: "2001-01-01", images: [{ url: "art", height: 1, width: 1 }] },
          preview_url: null
        }
      })?.releaseYear
    ).toBe(2001);
    expect(normalizeSpotifyTrack({ track: null })).toBeNull();
    expect(normalizeSpotifyTrack({ track: { id: "ep", name: "Episode", type: "episode" } })).toBeNull();
  });

  it("normalizes the renamed Spotify playlist item shape", () => {
    expect(
      normalizeSpotifyTrack({
        item: {
          id: "new-shape",
          name: "Track",
          type: "track",
          uri: "spotify:track:new-shape",
          duration_ms: 200000,
          external_urls: { spotify: "https://open.spotify.com/track/new-shape" },
          artists: [{ name: "Artist" }],
          album: { name: "Album", release_date: "2010", images: [] },
          preview_url: null
        }
      })?.id
    ).toBe("new-shape");
  });
});

describe("deck utilities", () => {
  it("shuffles without mutating the original array", () => {
    const tracks = [track("a", 1980), track("b", 1990)];
    const shuffled = shuffleTracks(tracks);
    expect(shuffled).toHaveLength(2);
    expect(tracks[0].id).toBe("a");
  });

  it("chooses a safe snippet start or zero for short tracks", () => {
    expect(getRandomSnippetStartMs(20_000, 30)).toBe(0);
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(getRandomSnippetStartMs(120_000, 30)).toBe(10_000);
    vi.restoreAllMocks();
  });
});

describe("timeline rules", () => {
  it("checks sorted insertion with equal-year flexibility", () => {
    const timeline = [track("a", 1984), track("b", 1991), track("c", 2003)];
    expect(isCorrectPlacement(timeline, track("x", 1997), 2)).toBe(true);
    expect(isCorrectPlacement(timeline, track("x", 1997), 1)).toBe(false);
    expect(isCorrectPlacement(timeline, track("y", 1991), 1)).toBe(true);
    expect(isCorrectPlacement(timeline, track("y", 1991), 2)).toBe(true);
  });

  it("passes when the guessed song year matches the year before or after the slot", () => {
    const timeline = [track("a", 1984), track("b", 1991), track("c", 1991), track("d", 2003)];
    expect(isCorrectPlacement(timeline, track("same-before", 1991), 2)).toBe(true);
    expect(isCorrectPlacement(timeline, track("same-after", 1991), 1)).toBe(true);
    expect(isCorrectPlacement(timeline, track("same-end", 1991), 3)).toBe(true);
  });

  it("returns the valid insertion range and inserts immutably", () => {
    const timeline = [track("a", 1984), track("b", 1991), track("c", 1991), track("d", 2003)];
    expect(getCorrectInsertionRange(timeline, track("x", 1991))).toEqual({ minIndex: 1, maxIndex: 3 });
    const inserted = insertTrackIntoTimeline(timeline, track("x", 1997), 3);
    expect(inserted.map((item) => item.id)).toEqual(["a", "b", "c", "x", "d"]);
    expect(timeline).toHaveLength(4);
  });
});

describe("scoring", () => {
  it("gates artist and title points behind correct placement", () => {
    expect(calculateRoundScore({ placementCorrect: false, artistCorrect: true, titleCorrect: true })).toBe(0);
    expect(calculateRoundScore({ placementCorrect: true, artistCorrect: false, titleCorrect: false })).toBe(5);
    expect(calculateRoundScore({ placementCorrect: true, artistCorrect: true, titleCorrect: true })).toBe(15);
  });

  it("rotates players and finds a winner", () => {
    const players = [
      { id: "a", name: "A", score: 5, timeline: [] },
      { id: "b", name: "B", score: 100, timeline: [] }
    ];
    expect(getNextPlayerIndex(players, 0)).toBe(1);
    expect(getNextPlayerIndex(players, 1)).toBe(0);
    expect(getWinner(players, 100)?.id).toBe("b");
  });
});
