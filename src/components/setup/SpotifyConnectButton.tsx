import { LogIn, LogOut, Music } from "lucide-react";
import { Button } from "../shared/Button";

type Props = {
  status: string;
  configured: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
};

export function SpotifyConnectButton({ status, configured, onConnect, onDisconnect }: Props) {
  const connected = status === "connected";
  return (
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
      <div className="mb-3 flex items-center gap-3 text-white">
        <div className="rounded-xl bg-mint/20 p-3 text-mint">
          <Music className="h-5 w-5" />
        </div>
        <div>
          <p className="font-black">Spotify</p>
          <p className="text-sm text-white/65">
            {configured ? (connected ? "Connected and ready" : "Connect a Premium host account") : "Client ID missing"}
          </p>
        </div>
      </div>
      {connected ? (
        <Button className="w-full" variant="ghost" icon={<LogOut className="h-5 w-5" />} onClick={onDisconnect}>
          Disconnect Spotify
        </Button>
      ) : (
        <Button
          className="w-full"
          disabled={!configured || status === "connecting"}
          icon={<LogIn className="h-5 w-5" />}
          onClick={onConnect}
        >
          {status === "connecting" ? "Connecting..." : "Connect Spotify"}
        </Button>
      )}
    </div>
  );
}
