import { Activity, ArrowRight } from "lucide-react";
import type { Screen } from "../lib/format";
import type { HpEvent, Player } from "../domain/types";
import { phaseLabel } from "../lib/format";

export function HistoryScreen({
  players,
  setScreen,
  hpEvents,
}: {
  players: Player[];
  setScreen: (s: Screen) => void;
  hpEvents: HpEvent[];
}) {
  return (
    <main className="px-5 pb-10">
      <div className="mb-5 mt-3 flex items-center gap-3">
        <button
          onClick={() => setScreen("game")}
          className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05]"
        >
          <ArrowRight size={18} />
        </button>
        <div>
          <h1 className="text-xl font-black">سوابق HP</h1>
          <p className="mt-1 text-xs text-zinc-500">
            تغییرات ثبت‌شده به ترتیب زمانی
          </p>
        </div>
      </div>
      {hpEvents.length === 0 ? (
        <div className="rounded-3xl border border-white/[0.07] p-8 text-center">
          <Activity className="mx-auto mb-3 text-zinc-600" size={28} />
          <p className="text-sm text-zinc-400">هنوز تغییری ثبت نشده است.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...hpEvents].reverse().map((e) => {
            const p = players.find((x) => x.id === e.playerId);
            return (
              <div
                key={e.id}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold">{p?.name ?? "بازیکن"}</div>
                  <span
                    dir="ltr"
                    className={`text-sm font-black ${e.delta < 0 ? "text-rose-300" : "text-emerald-300"}`}
                  >
                    {e.delta > 0 ? "+" : ""}
                    {e.delta} HP
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>
                    {phaseLabel(e.phase)} · {e.reason || "تغییر دستی"}
                  </span>
                  <span>
                    <bdi>{e.hpBefore}</bdi> ← <bdi>{e.hpAfter}</bdi>
                  </span>
                </div>
                {e.undoOf && (
                  <div className="mt-2 text-[10px] text-amber-300">
                    رویداد جبرانی (Undo)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
