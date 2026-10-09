import type { Dispatch, SetStateAction } from "react";
import { ArrowLeft, Shield } from "lucide-react";

export function SetupScreen({
  names,
  setNames,
  startGame,
}: {
  names: string[];
  setNames: Dispatch<SetStateAction<string[]>>;
  startGame: () => void;
}) {
  return (
    <main className="px-5 pb-10">
      <div className="relative mt-3 overflow-hidden rounded-[28px] border border-violet-300/15 bg-gradient-to-br from-violet-950/70 via-[#171522] to-[#111218] p-5">
        <div className="absolute -left-8 -top-10 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-400/10 px-3 py-1.5 text-[11px] font-bold text-violet-200">
            <Shield size={13} /> ابزار مدیریت بازی
          </div>
          <h1 className="text-3xl font-black leading-tight">
            میز گرداننده
            <br />
            <span className="text-violet-300">دمیج</span>
          </h1>
          <p className="mt-3 max-w-[260px] text-sm leading-6 text-zinc-400">
            مدیریت بازی مافیا، پخش دستی یا تصادفی نقش‌ها و کنترل HP بازیکنان.
          </p>
          <div className="mt-5 flex gap-2">
            <span className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-300">
              ۱۰ بازیکن
            </span>
            <span className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-300">
              HP اولیه: ۱۰۰
            </span>
          </div>
        </div>
      </div>
      <div className="mb-3 mt-7 flex items-center justify-between">
        <h2 className="font-bold">نام بازیکن‌ها</h2>
        <span className="text-xs text-zinc-500">۱۰ نفر</span>
      </div>
      <div className="space-y-2">
        {names.map((name, i) => (
          <label
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5 focus-within:border-violet-400/50"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-xs font-bold text-zinc-400">
              {String(i + 1).padStart(2, "0")}
            </span>
            <input
              value={name}
              onChange={(e) =>
                setNames((old) =>
                  old.map((v, idx) => (idx === i ? e.target.value : v)),
                )
              }
              maxLength={28}
              aria-label={`نام بازیکن ${i + 1}`}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-600"
              placeholder={`نام بازیکن ${i + 1}`}
            />
          </label>
        ))}
      </div>
      <button
        onClick={startGame}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 py-4 font-bold text-white shadow-lg shadow-violet-950/40 active:scale-[.99]"
      >
        شروع و تقسیم نقش <ArrowLeft size={18} />
      </button>
      <p className="mt-3 text-center text-[11px] leading-5 text-zinc-600">
        اطلاعات این نسخه روی همین مرورگر ذخیره می‌شود.
      </p>
    </main>
  );
}
