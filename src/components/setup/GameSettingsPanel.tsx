import type { GameSettings } from "../../types/game";

type Props = {
  settings: GameSettings;
  onChange: (settings: Partial<GameSettings>) => void;
};

export function GameSettingsPanel({ settings, onChange }: Props) {
  const targets = [50, 75, 100, 150];
  return (
    <div className="rounded-2xl bg-white/10 p-4 text-white ring-1 ring-white/15">
      <h2 className="mb-4 text-xl font-black">Game settings</h2>
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-bold">Target score</p>
          <div className="grid grid-cols-4 gap-2">
            {targets.map((target) => (
              <button
                key={target}
                className={`min-h-12 rounded-xl font-black ${
                  settings.targetScore === target ? "bg-lemon text-ink" : "bg-white/10 text-white"
                }`}
                onClick={() => onChange({ targetScore: target })}
              >
                {target}
              </button>
            ))}
          </div>
          <input
            aria-label="Custom target score"
            className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-ink/70 px-4 outline-none focus:border-lemon"
            type="number"
            min={25}
            step={5}
            value={settings.targetScore}
            onChange={(event) => onChange({ targetScore: Math.max(25, Number(event.target.value) || 100) })}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-bold">Snippet length</p>
          <div className="grid grid-cols-3 gap-2">
            {[15, 30, 45].map((seconds) => (
              <button
                key={seconds}
                className={`min-h-12 rounded-xl font-black ${
                  settings.snippetSeconds === seconds ? "bg-mint text-ink" : "bg-white/10 text-white"
                }`}
                onClick={() => onChange({ snippetSeconds: seconds as 15 | 30 | 45 })}
              >
                {seconds}s
              </button>
            ))}
          </div>
        </div>
        <label className="flex min-h-14 items-center justify-between rounded-xl bg-white/10 px-4">
          <span className="font-bold">Allow replay</span>
          <input
            className="h-6 w-6 accent-lemon"
            type="checkbox"
            checked={settings.allowReplay}
            onChange={(event) => onChange({ allowReplay: event.target.checked })}
          />
        </label>
      </div>
    </div>
  );
}
