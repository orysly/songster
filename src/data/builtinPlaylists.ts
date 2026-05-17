export type Era = "1960s" | "1970s" | "1980s" | "1990s" | "2000s" | "2010s";
export type Genre = "Pop" | "Rock" | "Hip Hop" | "Jazz" | "Hungarian" | "R&B" | "Disco" | "Electronic" | "Indie" | "Country" | "Metal";

export const ALL_ERAS: Era[] = ["1960s", "1970s", "1980s", "1990s", "2000s", "2010s"];
export const ALL_GENRES: Genre[] = [
  "Pop", "Rock", "Hip Hop", "R&B", "Disco", "Electronic", "Indie", "Country", "Metal", "Jazz", "Hungarian"
];

export const ERA_YEAR_RANGES: Record<Era, string> = {
  "1960s": "1960-1969",
  "1970s": "1970-1979",
  "1980s": "1980-1989",
  "1990s": "1990-1999",
  "2000s": "2000-2009",
  "2010s": "2010-2019"
};

export function isYearInEras(year: number, eras: Era[]): boolean {
  if (eras.length === 0) return true;
  return eras.some(era => {
    const [start, end] = ERA_YEAR_RANGES[era].split("-").map(Number);
    return year >= start && year <= end;
  });
}

const HUNGARIAN_ARTISTS_BY_ERA: Record<Era, string[]> = {
  "1960s": ["Illés", "Omega", "Metro", "Kovács Kati", "Zalatnay Sarolta", "Szécsi Pál", "Koncz Zsuzsa"],
  "1970s": ["Locomotiv GT", "Omega", "Piramis", "Neoton Família", "Kovács Kati", "Demjén Ferenc", "Cserháti Zsuzsa", "Skorpió", "Máté Péter"],
  "1980s": ["Edda Művek", "Bikini", "Első Emelet", "R-GO", "Dolly Roll", "KFT", "Neoton Família", "Zoltán Erika", "V-Moto Rock", "Korda György", "Hobo Blues Band"],
  "1990s": ["Ákos", "Republic", "Kispál és a Borz", "Hip Hop Boyz", "Happy Gang", "Animal Cannibals", "Kozmix", "Zámbó Jimmy", "Charlie", "TNT", "Bonanza Banzai", "Sub Bass Monster"],
  "2000s": ["Magna Cum Laude", "Tankcsapda", "Quimby", "Hooligans", "Kowalsky meg a Vega", "Nox", "Zséda", "Majka", "Belga", "Emilio", "V-Tech", "Groovehouse"],
  "2010s": ["Halott Pénz", "Wellhello", "Punnany Massif", "Bagossy Brothers Company", "Follow The Flow", "Majka", "Kowalsky meg a Vega", "Margaret Island", "ByeAlex", "Rúzsa Magdolna", "Kelemen Kabátban"]
};

const GENRE_MAPPING: Record<Genre, string[]> = {
  "Pop": ["genre:pop", "genre:dance pop"],
  "Rock": ["genre:rock", "genre:classic rock"],
  "Hip Hop": ["genre:hip hop", "genre:rap"],
  "R&B": ["genre:r&b", "genre:contemporary r&b"],
  "Disco": ["genre:disco"],
  "Electronic": ["genre:electronic", "genre:edm", "genre:house"],
  "Indie": ["genre:indie pop", "genre:indie rock"],
  "Country": ["genre:country", "genre:contemporary country"],
  "Metal": ["genre:metal", "genre:hard rock"],
  "Jazz": ["genre:jazz", "genre:vocal jazz"],
  // Hungarian is now handled via hardcoded artists per era
  "Hungarian": []
};

export interface SearchQuery {
  query: string;
  era: Era;
  genre: Genre;
}

/**
 * Generates an array of Spotify Search API queries based on the selected Eras and Genres.
 * If multiple eras and genres are selected, it creates a Cartesian product of combinations
 * so we can fetch a diverse spread of tracks.
 */
export function generateSearchQueries(eras: Era[], genres: Genre[]): SearchQuery[] {
  const queries: SearchQuery[] = [];
  
  // Default to all if none selected, though UI shouldn't allow this
  const activeEras = eras.length > 0 ? eras : ALL_ERAS;
  const activeGenres = genres.length > 0 ? genres : ALL_GENRES;

  for (const era of activeEras) {
    const yearFilter = `year:${ERA_YEAR_RANGES[era]}`;
    
    for (const genre of activeGenres) {
      if (genre === "Hungarian") {
        const artists = HUNGARIAN_ARTISTS_BY_ERA[era];
        // Chunk artists into groups of 3 to avoid query length limits
        for (let i = 0; i < artists.length; i += 3) {
          const chunk = artists.slice(i, i + 3);
          const artistQuery = chunk.map(a => `artist:"${a}"`).join(" OR ");
          queries.push({ query: `${yearFilter} ${artistQuery}`, era, genre });
        }
      } else {
        const genreKeywords = GENRE_MAPPING[genre];
        // Pick the primary mapping
        const keyword = genreKeywords[0]; 
        queries.push({ query: `${yearFilter} ${keyword}`, era, genre });
      }
    }
  }

  return queries;
}
