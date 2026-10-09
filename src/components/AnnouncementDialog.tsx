import type { Dispatch, SetStateAction } from "react";
import { Skull } from "lucide-react";
import type { Assignment, Game, Player } from "../domain/types";
import { markAnnounced } from "../domain/hp";

export function AnnouncementDialog({
  game,
  players,
  setGame,
  pending,
}: {
  game: Game;
  players: Player[];
  setGame: Dispatch<SetStateAction<Game | null>>;
  pending: Assignment[];
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#181922] p-5 text-center">
        <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-rose-400/10 text-rose-300">
          <Skull size={22} />
        </div>
        <h2 className="text-lg font-black">اعلام صبح</h2>
        <p className="mt-2 text-xs text-zinc-500">
          بازیکنانی که شب گذشته مرده‌اند:
        </p>
        <ul className="mt-3 space-y-2">
          {pending.map((a) => (
            <li
              key={a.playerId}
              className="rounded-xl bg-white/[0.05] py-3 text-sm font-bold"
            >
              {players.find((p) => p.id === a.playerId)?.name}
            </li>
          ))}
        </ul>
        <button
          onClick={() => setGame(markAnnounced(game))}
          className="mt-5 w-full rounded-xl bg-violet-500 py-3 text-sm font-bold"
        >
          اعلام شد
        </button>
      </div>
    </div>
  );
}
