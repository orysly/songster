import type { Track } from "../../types/game";
import { InsertionSlot } from "./InsertionSlot";
import { TimelineCard } from "./TimelineCard";

type Props = {
  timeline: Track[];
  selectedInsertionIndex: number | null;
  onSelectInsertion: (index: number) => void;
};

export function Timeline({ timeline, selectedInsertionIndex, onSelectInsertion }: Props) {
  const songCount = timeline.filter((track) => !track.isYearMarker).length;

  if (timeline.length === 0) {
    return (
      <div className="rounded-2xl bg-white/10 p-4 text-white ring-1 ring-white/15">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">Saved timeline</h2>
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-white/65">0 songs</span>
        </div>
        <p className="mb-3 text-base font-bold">Your timeline is empty. Pick the first slot to continue.</p>
        <InsertionSlot
          index={0}
          selected={selectedInsertionIndex === 0}
          label="Place first"
          onSelect={onSelectInsertion}
        />
      </div>
    );
  }

  return (
    <section className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
      <div className="mb-3 flex items-center justify-between gap-3 text-white">
        <div>
          <h2 className="text-xl font-black">Saved timeline</h2>
          <p className="text-sm font-bold text-white/65">Starter year included. Songs grow from correct placements.</p>
        </div>
        <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-white/70">
          {songCount} {songCount === 1 ? "song" : "songs"}
        </span>
      </div>
      <p className="mb-2 text-sm font-bold text-white/70">
        Tap a slot. Same-year songs are correct next to each other.
      </p>
      <div className="-mx-4 flex max-w-full gap-3 overflow-x-auto overscroll-x-contain px-4 pb-4">
        <InsertionSlot
          index={0}
          selected={selectedInsertionIndex === 0}
          label="Place before"
          onSelect={onSelectInsertion}
        />
        {timeline.map((track, index) => (
          <div key={`${track.id}-${index}`} className="flex shrink-0 gap-3">
            <TimelineCard track={track} />
            <InsertionSlot
              index={index + 1}
              selected={selectedInsertionIndex === index + 1}
              label={index === timeline.length - 1 ? "Place after" : "Place here"}
              onSelect={onSelectInsertion}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
