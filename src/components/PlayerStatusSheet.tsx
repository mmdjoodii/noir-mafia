import { X } from "lucide-react";
import type { Assignment, Player } from "../types";
import { statusLabel } from "../utils/format";
import { getScenarioRoleMap } from "../scenarios";
import { RoleImage } from "./RoleImage";

/** سناریوهای بدون HP: گرداننده وضعیت بازیکن را دستی مشخص می‌کند. */
export function PlayerStatusSheet({
  player,
  scenarioId,
  assignment,
  onSetStatus,
  onClose,
}: {
  player: Player;
  scenarioId: string;
  assignment: Assignment;
  onSetStatus: (status: "alive" | "dead") => void;
  onClose: () => void;
}) {
  const role = getScenarioRoleMap(scenarioId)[assignment.roleId];
  const dead = assignment.status === "dead";
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] rounded-t-[30px] border border-white/10 bg-[#15161e] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 shadow-2xl"
      >
        <div className="mb-5 flex items-center gap-3">
          <RoleImage
            role={role}
            className="h-16 w-12 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-black">{player.name}</h2>
            <p className="mt-1 text-xs text-zinc-500">
              {role.name} · {role.side === "mafia" ? "مافیا" : "شهروند"} ·{" "}
              {statusLabel(assignment)}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.05]"
          >
            <X size={17} />
          </button>
        </div>
        <button
          onClick={() => {
            onSetStatus(dead ? "alive" : "dead");
            onClose();
          }}
          className={`w-full rounded-2xl py-4 font-bold ${dead ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500 text-white"}`}
        >
          {dead ? "برگرداندن به بازی" : "حذف از بازی (مرده)"}
        </button>
      </section>
    </div>
  );
}
