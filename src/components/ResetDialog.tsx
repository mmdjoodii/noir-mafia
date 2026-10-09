import { CircleHelp } from "lucide-react";

export function ResetDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#181922] p-5">
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-rose-400/10 text-rose-300">
          <CircleHelp size={22} />
        </div>
        <h2 className="text-lg font-black">از ابتدا شروع شود؟</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          تقسیم نقش‌ها، HP و سوابق فعلی پاک می‌شوند. این کار قابل بازگشت نیست.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={onCancel}
            className="rounded-xl bg-white/[0.06] py-3 text-sm font-bold"
          >
            انصراف
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-rose-500 py-3 text-sm font-bold"
          >
            تأیید و شروع
          </button>
        </div>
      </div>
    </div>
  );
}
