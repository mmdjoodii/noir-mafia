import { Activity, Moon, Sun } from "lucide-react";
import type { Game } from "../domain/types";
import { phaseLabel } from "../lib/format";

export function AppHeader({ game }: { game: Game | null }) {
  return (
    <header className="flex items-center justify-between px-5 pb-4 pt-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-500 text-white shadow-lg shadow-violet-950/40">
          <Activity size={21} />
        </div>
        <div>
          <div className="text-sm font-black tracking-wide">
            NOIR <span className="text-violet-300">MAFIA</span>
          </div>
          <div className="mt-0.5 text-[10px] text-zinc-500">
            پنل اختصاصی گرداننده
          </div>
        </div>
      </div>
      {game && (
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-300">
          {game.phase.kind === "day" || game.phase.kind === "intro-day" ? (
            <Sun className="ml-1 inline text-amber-300" size={13} />
          ) : (
            <Moon className="ml-1 inline text-indigo-300" size={13} />
          )}{" "}
          {phaseLabel(game.phase)}
        </div>
      )}
    </header>
  );
}
