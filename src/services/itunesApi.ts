import { getReleaseYear } from "../utils/spotifyTrack";

type ItunesResult = {
  trackName: string;
  artistName: string;
  releaseDate: string;
};

type ItunesResponse = {
  resultCount: number;
  results: ItunesResult[];
};

export async function searchItunesReleaseDate(
  title: string,
  artist: string
): Promise<{ releaseDate: string; releaseYear: number } | null> {
  try {
    // Basic sanitization to improve search by removing "(feat. X)"
    const cleanTitle = title.replace(/\(feat\..*?\)|\(with.*?\)/i, "").trim();
    const query = encodeURIComponent(`${cleanTitle} ${artist}`);
    
    const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=50`);
    if (!response.ok) return null;
    
    const data = (await response.json()) as ItunesResponse;
    if (!data || data.resultCount === 0) return null;

    let oldestDateStr: string | null = null;
    let oldestYear: number = 9999;

    // A loose matcher for the artist name to filter out covers
    const targetArtistLower = artist.toLowerCase();

    for (const item of data.results) {
      if (!item.releaseDate) continue;
      
      // Ensure the artist roughly matches to avoid covers by other bands
      if (!item.artistName.toLowerCase().includes(targetArtistLower)) {
         continue;
      }

      // iTunes returns ISO dates like "1975-10-31T12:00:00Z"
      const datePart = item.releaseDate.split("T")[0];
      const yearStr = datePart.split("-")[0];
      const year = parseInt(yearStr, 10);

      if (!isNaN(year) && year < oldestYear) {
        oldestYear = year;
        oldestDateStr = datePart;
      }
    }

    if (oldestDateStr && oldestYear !== 9999) {
      return { releaseDate: oldestDateStr, releaseYear: oldestYear };
    }

    return null;
  } catch (err) {
    console.error("Failed to fetch iTunes release date", err);
    return null;
  }
}
