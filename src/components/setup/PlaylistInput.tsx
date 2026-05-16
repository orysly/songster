import { useState } from "react";
import { ListMusic } from "lucide-react";
import { Button } from "../shared/Button";

type Props = {
  loading: boolean;
  disabled: boolean;
  onLoad: (value: string) => void;
  onDeveloperLoad: () => void;
  showDeveloperFallback: boolean;
};

export function PlaylistInput({ loading, disabled, onLoad, onDeveloperLoad, showDeveloperFallback }: Props) {
  const [value, setValue] = useState("");
  return (
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
      <label className="mb-2 block text-sm font-bold text-white" htmlFor="playlist">
        Spotify playlist
      </label>
      <input
        id="playlist"
        className="min-h-12 w-full rounded-xl border border-white/15 bg-ink/70 px-4 text-base text-white outline-none placeholder:text-white/35 focus:border-white"
        placeholder="https://open.spotify.com/playlist/..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Button
        className="mt-3 w-full"
        disabled={disabled || loading}
        icon={<ListMusic className="h-5 w-5" />}
        onClick={() => onLoad(value)}
      >
        {loading ? "Loading playlist..." : "Load playlist"}
      </Button>
      {showDeveloperFallback ? (
        <Button className="mt-2 w-full" variant="ghost" onClick={onDeveloperLoad}>
          Load developer fallback
        </Button>
      ) : null}
    </div>
  );
}
