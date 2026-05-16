import type { Track } from "../../types/game";

export function TimelineCard({ track, compact = false }: { track: Track; compact?: boolean }) {
  if (track.isYearMarker) {
    return (
      <div className={`${compact ? "w-36" : "w-44"} shrink-0 rounded-2xl bg-white p-3 text-ink shadow-glow`}>
        <div className="grid aspect-square w-full place-items-center rounded-xl bg-ink text-paper">
          <span className="text-4xl font-black">{track.releaseYear}</span>
        </div>
        <p className="mt-3 text-sm font-black uppercase tracking-wide">Starter year</p>
        <p className="mt-1 text-xs font-bold text-ink/65">Place songs before or after</p>
      </div>
    );
  }

  return (
    <div className={`${compact ? "w-36" : "w-44"} shrink-0 rounded-2xl bg-paper p-3 text-ink shadow-glow`}>
      {track.artworkUrl ? (
        <img className="mb-2 aspect-square w-full rounded-xl object-cover" src={track.artworkUrl} alt="" />
      ) : (
        <div className="mb-2 grid aspect-square w-full place-items-center rounded-xl bg-ink text-paper">
          <span className="text-3xl font-black">{track.releaseYear}</span>
        </div>
      )}
      <p className="text-2xl font-black leading-none">{track.releaseYear}</p>
      <p className="mt-2 line-clamp-2 text-sm font-black leading-5">{track.title}</p>
      <p className="mt-1 line-clamp-2 text-xs font-bold text-ink/65">{track.artists.join(", ")}</p>
    </div>
  );
}
