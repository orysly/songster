import { Share } from "lucide-react";

export function InstallPwaHint() {
  return (
    <div className="rounded-2xl bg-white/10 p-4 text-sm leading-6 text-white/78 ring-1 ring-white/15">
      <div className="flex gap-3">
        <Share className="mt-1 h-5 w-5 shrink-0 text-mint" />
        <p>
          On iPhone, install from Safari with <strong>Share → Add to Home Screen</strong>. The app shell
          can open offline, but Spotify gameplay needs internet.
        </p>
      </div>
    </div>
  );
}
