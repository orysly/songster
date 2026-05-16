import { AlertTriangle, X } from "lucide-react";
import { Button } from "./Button";

type Props = {
  message: string | null;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
};

export function ErrorBanner({ message, actionLabel, onAction, onDismiss }: Props) {
  if (!message) return null;
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-white shadow-glow">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-white/70" />
        <p className="flex-1 text-sm leading-6">{message}</p>
        {onDismiss ? (
          <button aria-label="Dismiss" className="rounded-full p-1 text-white/70" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {actionLabel && onAction ? (
        <Button className="mt-3 w-full" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
