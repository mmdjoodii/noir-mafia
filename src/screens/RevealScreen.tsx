import { Check, Shield } from "lucide-react";
import type { Player } from "../domain/types";
import { rolesById as roleMap } from "../scenarios";

export function RevealScreen({
  players,
  finishReveal,
  selectedPlayerId,
  revealedRoleId,
  showCard,
  setShowCard,
}: {
  players: Player[];
  finishReveal: () => void;
  selectedPlayerId: string;
  revealedRoleId: string;
  showCard: boolean;
  setShowCard: (v: boolean) => void;
}) {
  return (
    <main className="flex min-h-[calc(100dvh-80px)] flex-col items-center px-6 pb-8 pt-4 text-center">
      <div className="mb-6 w-full">
        <div className="text-xs font-bold text-violet-300">
          نمایش محرمانه نقش
        </div>
        <h1 className="mt-2 text-2xl font-black">
          {players.find((p) => p.id === selectedPlayerId)?.name ?? "بازیکن"}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">کارت را لمس کن و نگه دار</p>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          گوشی را به بازیکن بده. با برداشتن انگشت، کارت پنهان می‌شود.
        </p>
      </div>
      <div className="relative flex w-full max-w-[290px] flex-1 items-center justify-center">
        <button
          aria-label="برای مشاهده کارت انگشت را نگه دارید"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setShowCard(true);
          }}
          onPointerUp={() => setShowCard(false)}
          onPointerCancel={() => setShowCard(false)}
          onContextMenu={(e) => e.preventDefault()}
          className="relative aspect-[2/3] w-full overflow-hidden rounded-[26px] border border-violet-300/20 bg-gradient-to-br from-[#211b38] via-[#14131e] to-[#0f1018] shadow-2xl shadow-violet-950/30 select-none"
        >
          {showCard ? (
            <img
              src={roleMap[revealedRoleId]?.cardImage}
              alt="کارت نقش بازیکن"
              className="card-image h-full w-full"
              draggable={false}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-7">
              <div className="grid h-20 w-20 place-items-center rounded-3xl border border-violet-300/20 bg-violet-400/10 text-violet-200">
                <Shield size={38} />
              </div>
              <div className="mt-7 text-lg font-black tracking-widest">
                NOIR
              </div>
              <div className="mt-1 text-[10px] tracking-[.3em] text-violet-200/70">
                SECRET ROLE
              </div>
              <div className="mt-12 flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-xs text-zinc-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-violet-300" />{" "}
                لمس طولانی برای نمایش
              </div>
            </div>
          )}
        </button>
      </div>
      <button
        onClick={finishReveal}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] py-4 font-bold"
      >
        پایان مشاهده و ادامه <Check size={17} />
      </button>
      <p className="mt-3 text-[10px] text-zinc-600">
        این صفحه فقط کارت نقش را نمایش می‌دهد.
      </p>
    </main>
  );
}
