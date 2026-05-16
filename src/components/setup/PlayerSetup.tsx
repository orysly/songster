import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Player } from "../../types/game";
import { Button } from "../shared/Button";

type Props = {
  players: Player[];
  onAdd: (name: string) => void;
  onEdit: (id: string, name: string) => void;
  onRemove: (id: string) => void;
};

export function PlayerSetup({ players, onAdd, onEdit, onRemove }: Props) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  function add() {
    onAdd(name);
    setName("");
  }

  function saveEdit() {
    if (!editingId) return;
    onEdit(editingId, editingName);
    setEditingId(null);
    setEditingName("");
  }

  return (
    <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
      <h2 className="mb-3 text-xl font-black text-white">Players</h2>
      <div className="flex gap-2">
        <input
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-white/15 bg-ink/70 px-4 text-white outline-none placeholder:text-white/35 focus:border-lemon"
          placeholder="Player name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") add();
          }}
        />
        <Button aria-label="Add player" icon={<Plus className="h-5 w-5" />} onClick={add}>
          Add
        </Button>
      </div>
      <div className="mt-3 space-y-2">
        {players.map((player) => (
          <div key={player.id} className="flex items-center gap-2 rounded-xl bg-ink/55 p-2 text-white">
            {editingId === player.id ? (
              <input
                className="min-h-11 min-w-0 flex-1 rounded-lg bg-white/10 px-3 outline-none focus:ring-2 focus:ring-lemon"
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") saveEdit();
                }}
              />
            ) : (
              <span className="min-w-0 flex-1 truncate px-2 font-bold">{player.name}</span>
            )}
            {editingId === player.id ? (
              <Button className="min-h-11 px-3" variant="secondary" onClick={saveEdit}>
                Save
              </Button>
            ) : (
              <button
                aria-label={`Edit ${player.name}`}
                className="rounded-lg p-3 text-white/70 hover:bg-white/10"
                onClick={() => {
                  setEditingId(player.id);
                  setEditingName(player.name);
                }}
              >
                <Pencil className="h-5 w-5" />
              </button>
            )}
            <button
              aria-label={`Remove ${player.name}`}
              className="rounded-lg p-3 text-coral hover:bg-coral/10"
              onClick={() => onRemove(player.id)}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
      {players.length < 2 ? <p className="mt-3 text-sm text-white/60">Add at least two players.</p> : null}
    </div>
  );
}
