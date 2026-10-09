import { Minus, Plus, RotateCcw, X } from "lucide-react";
import type { Assignment, Game, Player } from "../domain/types";
import { phaseLabel } from "../lib/format";
import { hpCauses } from "../lib/hpCauses";
import { rolesById as roleMap } from "../scenarios";

export function HpSheet({
  game,
  players,
  assignments,
  undoHp,
  applyRoulette,
  hpPlayerId,
  setHpPlayerId,
  selectedPlayer,
  selectedAssignment,
  customAmount,
  setCustomAmount,
  customReason,
  setCustomReason,
  selectedCauseId,
  setSelectedCauseId,
  roulettePartnerId,
  setRoulettePartnerId,
  customMode,
  setCustomMode,
  changeHp,
}: {
  game: Game;
  players: Player[];
  assignments: Assignment[];
  undoHp: () => void;
  applyRoulette: () => void;
  hpPlayerId: string;
  setHpPlayerId: (id: string) => void;
  selectedPlayer: Player;
  selectedAssignment: Assignment;
  customAmount: string;
  setCustomAmount: (v: string) => void;
  customReason: string;
  setCustomReason: (v: string) => void;
  selectedCauseId: string;
  setSelectedCauseId: (v: string) => void;
  roulettePartnerId: string;
  setRoulettePartnerId: (v: string) => void;
  customMode: "damage" | "heal";
  setCustomMode: (m: "damage" | "heal") => void;
  changeHp: (delta: number, reason?: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={() => setHpPlayerId("")}
    >
      <section
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] rounded-t-[30px] border border-white/10 bg-[#15161e] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 shadow-2xl"
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/15" />
        <div className="mb-5 flex items-center gap-3">
          <img
            src={roleMap[selectedAssignment.roleId].cardImage}
            alt=""
            className="h-16 w-12 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-black">
              {selectedPlayer.name}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {roleMap[selectedAssignment.roleId].name}
            </p>
          </div>
          <button
            onClick={() => setHpPlayerId("")}
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05]"
          >
            <X size={17} />
          </button>
        </div>
        <div className="mb-5 rounded-2xl bg-black/20 p-4 text-center">
          <div className="text-xs text-zinc-500">HP فعلی</div>
          <div
            dir="ltr"
            className={`mt-1 text-4xl font-black tabular-nums ${selectedAssignment.hp <= 0 ? "text-rose-300" : "text-emerald-300"}`}
          >
            {selectedAssignment.hp}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${selectedAssignment.hp <= 30 ? "bg-amber-300" : "bg-emerald-400"}`}
              style={{
                width: `${Math.max(0, Math.min(100, selectedAssignment.hp))}%`,
              }}
            />
          </div>
        </div>
        <label
          className="mb-2 block text-xs font-bold text-zinc-300"
          htmlFor="hp-cause"
        >
          علت تغییر HP
        </label>
        <select
          id="hp-cause"
          value={selectedCauseId}
          onChange={(e) => {
            const cause = hpCauses.find((item) => item.id === e.target.value);
            setSelectedCauseId(e.target.value);
            setCustomReason(cause?.label ?? "");
            setCustomMode(cause?.mode ?? "damage");
            setCustomAmount(cause?.amount ?? "");
          }}
          className="mb-3 w-full rounded-xl border border-white/10 bg-[#20212b] px-3 py-3 text-xs text-zinc-100 outline-none focus:border-violet-400/50"
        >
          <option value="">انتخاب علت (اختیاری)</option>
          <optgroup label="روز">
            {hpCauses
              .filter((c) => c.label.startsWith("روز"))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
          </optgroup>
          <optgroup label="شب">
            {hpCauses
              .filter((c) => c.label.startsWith("شب"))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
          </optgroup>
          <optgroup label="سایر">
            {hpCauses
              .filter(
                (c) => !c.label.startsWith("روز") && !c.label.startsWith("شب"),
              )
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
          </optgroup>
        </select>
        {selectedCauseId === "chaos-vote" && (
          <p className="-mt-1 mb-3 text-[10px] leading-5 text-amber-200/80">
            برای چند رأی، مقدار را برابر ۱۰ × تعداد رأی وارد کن؛ مثلاً ۳ رأی =
            ۳۰ دمیج.
          </p>
        )}
        {selectedCauseId === "roulette" && (
          <div className="mb-3 rounded-2xl border border-violet-300/15 bg-violet-400/[0.06] p-3">
            <p className="mb-2 text-xs leading-5 text-violet-100">
              بازیکن دوم را انتخاب کن؛ HP این دو بازیکن با هم جمع و بر ۲ تقسیم
              می‌شود و هر دو دقیقاً به میانگین می‌رسند.
            </p>
            <select
              value={roulettePartnerId}
              onChange={(e) => setRoulettePartnerId(e.target.value)}
              className="mb-2 w-full rounded-xl border border-white/10 bg-[#20212b] px-3 py-3 text-xs text-zinc-100"
            >
              <option value="">انتخاب بازیکن دوم</option>
              {players
                .filter((p) => p.id !== hpPlayerId)
                .map((p) => {
                  const a = assignments.find((item) => item.playerId === p.id);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} · HP {a?.hp ?? "—"}
                    </option>
                  );
                })}
            </select>
            <button
              onClick={applyRoulette}
              disabled={!roulettePartnerId || roulettePartnerId === hpPlayerId}
              className="w-full rounded-xl bg-violet-500 py-3 text-xs font-bold disabled:opacity-40"
            >
              محاسبه و یکسان‌کردن HP
            </button>
          </div>
        )}
        {selectedCauseId !== "roulette" && (
          <div className="mb-3 grid grid-cols-5 gap-2">
            {[5, 10, 20, 40, 100].map((n) => (
              <button
                key={n}
                onClick={() => changeHp(-n, customReason || `کسر سریع ${n}`)}
                className="rounded-xl border border-rose-400/10 bg-rose-400/[0.06] py-3 text-xs font-bold text-rose-200"
              >
                −{n}
              </button>
            ))}
          </div>
        )}
        {selectedCauseId !== "roulette" && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setCustomMode("damage")}
                className={`rounded-xl py-2.5 text-xs font-bold ${customMode === "damage" ? "bg-rose-400/15 text-rose-200" : "bg-white/[0.04] text-zinc-500"}`}
              >
                <Minus className="ml-1 inline" size={14} /> کسر دلخواه
              </button>
              <button
                onClick={() => setCustomMode("heal")}
                className={`rounded-xl py-2.5 text-xs font-bold ${customMode === "heal" ? "bg-emerald-400/15 text-emerald-200" : "bg-white/[0.04] text-zinc-500"}`}
              >
                <Plus className="ml-1 inline" size={14} /> افزایش دلخواه
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="مقدار HP"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm outline-none focus:border-violet-400/50"
              />
              <button
                disabled={!customAmount || Number(customAmount) <= 0}
                onClick={() =>
                  changeHp(
                    (customMode === "damage" ? -1 : 1) * Number(customAmount),
                    customReason ||
                      (customMode === "damage"
                        ? "کسر دلخواه"
                        : "افزایش دلخواه"),
                  )
                }
                className="rounded-xl bg-violet-500 px-5 text-sm font-bold disabled:opacity-40"
              >
                ثبت تغییر
              </button>
            </div>
            <input
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="توضیح تکمیلی برای علت (اختیاری)"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-xs outline-none focus:border-violet-400/50"
            />
          </>
        )}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={undoHp}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-zinc-400"
          >
            <RotateCcw size={13} /> بازگردانی آخرین تغییر
          </button>
          <span className="text-[10px] text-zinc-600">
            {game ? phaseLabel(game.phase) : ""}
          </span>
        </div>
      </section>
    </div>
  );
}
