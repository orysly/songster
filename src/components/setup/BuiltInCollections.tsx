import { useState } from "react";
import { builtinPlaylists, ALL_ERAS, ALL_GENRES, type Era, type Genre } from "../../data/builtinPlaylists";
import { Button } from "../shared/Button";

type Props = {
  disabled: boolean;
  loading: boolean;
  onLoadPlaylists: (playlistIds: string[]) => Promise<void>;
};

export function BuiltInCollections({ disabled, loading, onLoadPlaylists }: Props) {
  const [selectedEras, setSelectedEras] = useState<Era[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);

  function toggleEra(era: Era) {
    if (selectedEras.includes(era)) {
      setSelectedEras(selectedEras.filter((e) => e !== era));
    } else {
      setSelectedEras([...selectedEras, era]);
    }
  }

  function toggleGenre(genre: Genre) {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  }

  function handleGenerate() {
    if (selectedEras.length === 0 && selectedGenres.length === 0) return;

    // Find all playlists that match the selected criteria
    const matchingIds = builtinPlaylists
      .filter((pl) => {
        const matchesEra = selectedEras.length === 0 || pl.eras.some((e) => selectedEras.includes(e));
        const matchesGenre = selectedGenres.length === 0 || pl.genres.some((g) => selectedGenres.includes(g));
        return matchesEra && matchesGenre;
      })
      .map((pl) => pl.id);

    // Filter out duplicates just in case
    const uniqueIds = Array.from(new Set(matchingIds));
    
    if (uniqueIds.length > 0) {
      void onLoadPlaylists(uniqueIds);
    }
  }

  const hasSelection = selectedEras.length > 0 || selectedGenres.length > 0;

  return (
    <section className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10 md:p-6">
      <h2 className="text-xl font-bold text-white">Curated Collections</h2>
      <p className="mt-1 text-sm text-white/60">
        Select eras and genres to instantly generate a huge party deck.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-white/55">Decades</h3>
          <div className="flex flex-wrap gap-2">
            {ALL_ERAS.map((era) => (
              <button
                key={era}
                onClick={() => toggleEra(era)}
                disabled={disabled}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  selectedEras.includes(era)
                    ? "bg-brand-500 text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/20 disabled:opacity-50"
                }`}
              >
                {era}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-white/55">Genres</h3>
          <div className="flex flex-wrap gap-2">
            {ALL_GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                disabled={disabled}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  selectedGenres.includes(genre)
                    ? "bg-brand-500 text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/20 disabled:opacity-50"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button
          onClick={handleGenerate}
          disabled={disabled || loading || !hasSelection}
          className="w-full"
        >
          {loading ? "Generating..." : "Generate Deck"}
        </Button>
      </div>
    </section>
  );
}
