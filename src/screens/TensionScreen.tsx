import { useEffect, useRef } from "react";
import { Lock } from "lucide-react";

type Props = {
  onComplete: () => void;
};

function playHeartbeat(audioCtx: AudioContext) {
  // A simple procedural deep heartbeat using Web Audio API
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  // Pitch drop
  oscillator.frequency.setValueAtTime(60, now);
  oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.1);

  // Volume envelope for the first "lub"
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(1, now + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

  // The second "dub"
  oscillator.frequency.setValueAtTime(60, now + 0.25);
  oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.35);

  gainNode.gain.setValueAtTime(0, now + 0.25);
  gainNode.gain.linearRampToValueAtTime(1, now + 0.3);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

  oscillator.start(now);
  oscillator.stop(now + 0.6);
}

export function TensionScreen({ onComplete }: Props) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtxRef.current = new AudioContextClass();
    }

    let intervalId: number;

    const tick = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === "running") {
        playHeartbeat(audioCtxRef.current);
      }
    };

    // Play immediately, then every 800ms
    tick();
    intervalId = window.setInterval(tick, 800);

    const timerId = setTimeout(() => {
      clearInterval(intervalId);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
      onComplete();
    }, 3000); // 3 seconds of tension

    return () => {
      clearInterval(intervalId);
      clearTimeout(timerId);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [onComplete]);

  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center justify-center animate-pulse gap-6 text-brand-500">
        <Lock className="h-32 w-32 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)] text-brand-500" />
        <h1 className="text-4xl font-black uppercase tracking-widest text-brand-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]">
          LOCKED
        </h1>
      </div>
    </main>
  );
}
