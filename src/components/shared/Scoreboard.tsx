import type { Player } from "../../types/game";

export function Scoreboard({ players, currentPlayerId }: { players: Player[]; currentPlayerId?: string }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {players.map((player) => (
        <div
          key={player.id}
          className={`rounded-xl p-3 ring-1 ${
            player.id === currentPlayerId
              ? "bg-white text-ink ring-white"
              : "bg-white/10 text-white ring-white/15"
          }`}
        >
          <p className="truncate text-sm font-bold">{player.name}</p>
          <p className="text-2xl font-black">{player.score}</p>
        </div>
      ))}
    </div>
  );
}
