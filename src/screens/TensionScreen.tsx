import { useEffect, useRef } from "react";

type Props = {
  onComplete: () => void;
};

function playHeartbeat(audioCtx: AudioContext) {
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

    // Play immediately, then once more at 700ms (shorter duration)
    tick();
    intervalId = window.setInterval(tick, 700);

    const timerId = setTimeout(() => {
      clearInterval(intervalId);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
      onComplete();
    }, 1500); // 1.5 seconds of high-fidelity split animation

    return () => {
      clearInterval(intervalId);
      clearTimeout(timerId);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [onComplete]);

  return (
    <main className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden select-none">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spinAndSplitLeft {
          0% {
            transform: rotate(0deg) translateX(0);
            opacity: 1;
          }
          25% {
            transform: rotate(90deg) translateX(0);
            opacity: 1;
          }
          100% {
            transform: rotate(90deg) translateX(-180px);
            opacity: 0;
          }
        }
        @keyframes spinAndSplitRight {
          0% {
            transform: rotate(0deg) translateX(0);
            opacity: 1;
          }
          25% {
            transform: rotate(90deg) translateX(0);
            opacity: 1;
          }
          100% {
            transform: rotate(90deg) translateX(180px);
            opacity: 0;
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            filter: drop-shadow(0 0 15px rgba(255, 0, 85, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 35px rgba(255, 0, 85, 0.95));
          }
        }
      ` }} />

      <div 
        className="relative w-[200px] h-[200px] mb-8"
        style={{ animation: "pulseGlow 1.5s infinite ease-in-out" }}
      >
        {/* Left Semi-Circle Vinyl */}
        <div 
          className="absolute top-0 left-0 w-[100px] h-[200px] bg-neutral-900 border-y border-l border-white/10"
          style={{
            borderRadius: "100px 0 0 100px",
            background: "radial-gradient(circle at right, #ff0055 0%, #1f1f1f 22%, #0d0d0d 65%, #2a2a2a 100%)",
            transformOrigin: "right center",
            animation: "spinAndSplitLeft 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards"
          }}
        >
          <div className="absolute top-[20px] right-0 w-[80px] h-[160px] border-y border-l border-white/5" style={{ borderRadius: "80px 0 0 80px" }} />
          <div className="absolute top-[40px] right-0 w-[60px] h-[120px] border-y border-l border-white/5" style={{ borderRadius: "60px 0 0 60px" }} />
          <div className="absolute top-[70px] right-0 w-[30px] h-[60px] bg-[#ff0055]" style={{ borderRadius: "30px 0 0 30px" }}>
            <div className="absolute top-[25px] right-0 w-[5px] h-[10px] bg-black border-y border-l border-white/20" style={{ borderRadius: "5px 0 0 5px" }} />
          </div>
        </div>

        {/* Right Semi-Circle Vinyl */}
        <div 
          className="absolute top-0 right-0 w-[100px] h-[200px] bg-neutral-900 border-y border-r border-white/10"
          style={{
            borderRadius: "0 100px 100px 0",
            background: "radial-gradient(circle at left, #ff0055 0%, #1f1f1f 22%, #0d0d0d 65%, #2a2a2a 100%)",
            transformOrigin: "left center",
            animation: "spinAndSplitRight 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards"
          }}
        >
          <div className="absolute top-[20px] left-0 w-[80px] h-[160px] border-y border-r border-white/5" style={{ borderRadius: "0 80px 80px 0" }} />
          <div className="absolute top-[40px] left-0 w-[60px] h-[120px] border-y border-r border-white/5" style={{ borderRadius: "0 60px 60px 0" }} />
          <div className="absolute top-[70px] left-0 w-[30px] h-[60px] bg-[#ff0055]" style={{ borderRadius: "0 30px 30px 0" }}>
            <div className="absolute top-[25px] left-0 w-[5px] h-[10px] bg-black border-y border-r border-white/20" style={{ borderRadius: "0 5px 5px 0" }} />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-2">
        <h1 
          className="text-3xl font-black uppercase tracking-[0.25em] text-[#ff0055] drop-shadow-[0_0_15px_rgba(255,0,85,0.7)] animate-pulse"
          style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
        >
          REVEALING SONG...
        </h1>
        <p className="text-xs uppercase tracking-[0.4em] text-white/40">Ready Player One</p>
      </div>
    </main>
  );
}
