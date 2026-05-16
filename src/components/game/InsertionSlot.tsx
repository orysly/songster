type Props = {
  index: number;
  selected: boolean;
  label: string;
  onSelect: (index: number) => void;
};

export function InsertionSlot({ index, selected, label, onSelect }: Props) {
  return (
    <button
      className={`min-h-16 w-28 shrink-0 rounded-2xl px-3 text-sm font-black transition ${
        selected ? "bg-lemon text-ink shadow-glow" : "bg-white/12 text-white ring-1 ring-white/20"
      }`}
      onClick={() => onSelect(index)}
    >
      {label}
    </button>
  );
}
