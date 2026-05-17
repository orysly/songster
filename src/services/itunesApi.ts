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
    // Aggressively clean the title to remove " - Remastered", "(Live)", etc.
    // iTunes fails to return results if we pass exact Spotify remastered titles.
    const cleanTitle = title.split(/[-(\[]/)[0].trim();
    const query = encodeURIComponent(`${cleanTitle} ${artist}`);
    
    let response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=50`).catch(() => null);
    
    // If rate-limited or blocked by CORS, try via a proxy
    if (!response || !response.ok) {
      console.warn(`Direct iTunes fetch failed for ${title}, falling back to proxy...`);
      response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://itunes.apple.com/search?term=${query}&entity=song&limit=50`)}`).catch(() => null);
    }

    if (!response || !response.ok) return null;
    
    const data = (await response.json()) as ItunesResponse;
    if (!data || data.resultCount === 0) return null;

    let oldestDateStr: string | null = null;
    let oldestYear: number = 9999;

    // Normalize strings to remove accents/diacritics
    const normalizeStr = (str: string) => 
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const targetArtistNormalized = normalizeStr(artist);
    const targetArtistWords = targetArtistNormalized.split(/\s+/);

    const targetTitleNormalized = normalizeStr(cleanTitle);
    const targetTitleWords = targetTitleNormalized.split(/\s+/).filter(w => w.length > 2);

    for (const item of data.results) {
      if (!item.releaseDate) continue;
      
      const itemArtistNormalized = normalizeStr(item.artistName);
      const itemTitleNormalized = normalizeStr(item.trackName);
      
      // Ensure the artist roughly matches (check if at least one significant word matches)
      // This handles "Pál Szécsi" vs "Szécsi Pál"
      const hasArtistMatch = targetArtistWords.some(word => 
        word.length > 2 && itemArtistNormalized.includes(word)
      );

      if (!hasArtistMatch && targetArtistWords.length > 0) {
         continue;
      }

      // Ensure the track title roughly matches to avoid picking a completely different song 
      // from the same artist that happens to be in a compilation matching the search terms.
      const hasTitleMatch = targetTitleWords.length === 0 || targetTitleWords.some(word => 
        itemTitleNormalized.includes(word)
      );

      if (!hasTitleMatch) {
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
