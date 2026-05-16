import { RotateCcw } from "lucide-react";
import { Button } from "../shared/Button";

export function ResumeGameBanner({ onResume }: { onResume: () => void }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-white">
      <p className="text-sm leading-6">
        Game restored. Playback will stay paused until someone taps Play again.
      </p>
      <Button className="mt-3 w-full" variant="secondary" icon={<RotateCcw className="h-5 w-5" />} onClick={onResume}>
        Resume game
      </Button>
    </div>
  );
}
