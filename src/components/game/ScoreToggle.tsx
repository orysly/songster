type Props = {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
};

export function ScoreToggle({ label, checked, disabled, onChange }: Props) {
  return (
    <label
      className={`flex min-h-14 items-center justify-between rounded-xl px-4 ${
        disabled ? "bg-white/5 text-white/35" : "bg-white/10 text-white"
      }`}
    >
      <span className="font-bold">{label}</span>
      <input
        className="h-6 w-6 accent-lemon"
        type="checkbox"
        disabled={disabled}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
