import { X } from "lucide-react";
import type { Assignment, Player } from "../domain/types";
import { statusLabel } from "../lib/format";
import { rolesById as roleMap } from "../scenarios";

export function PlayerListSheet({
  players,
  openHp,
  setListKind,
  listKind,
  listPlayers,
}: {
  players: Player[];
  openHp: (id: string) => void;
  setListKind: (k: "dead" | "coma" | null) => void;
  listKind: "dead" | "coma";
  listPlayers: Assignment[];
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={() => setListKind(null)}
    >
      <section
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80dvh] w-full max-w-[480px] overflow-y-auto rounded-t-[30px] border border-white/10 bg-[#15161e] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black">
            {listKind === "dead" ? "بازیکنان مرده" : "بازیکنان در کما"}{" "}
            <span className="text-sm text-zinc-500">
              ({listPlayers.length})
            </span>
          </h2>
          <button
            onClick={() => setListKind(null)}
            aria-label="بستن"
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05]"
          >
            <X size={17} />
          </button>
        </div>
        {listPlayers.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">
            کسی در این وضعیت نیست.
          </p>
        ) : (
          <div className="space-y-2">
            {listPlayers.map((a) => (
              <button
                key={a.playerId}
                onClick={() => {
                  setListKind(null);
                  openHp(a.playerId);
                }}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3 text-right"
              >
                <img
                  src={roleMap[a.roleId].cardImage}
                  alt=""
                  className="h-14 w-10 rounded-lg bg-black/30 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">
                    {players.find((p) => p.id === a.playerId)?.name}
                  </div>
                  <div className="mt-1 text-[11px] text-zinc-500">
                    {roleMap[a.roleId].name} · {statusLabel(a)}
                  </div>
                </div>
                <span
                  dir="ltr"
                  className="text-lg font-black tabular-nums text-rose-300"
                >
                  {a.hp}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
