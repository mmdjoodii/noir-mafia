import { Activity } from "lucide-react";

export function DesktopNotice() {
  return (
    <div className="hidden min-h-dvh items-center justify-center p-8 text-center sm:flex">
      <div className="max-w-sm">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-violet-500/15 text-violet-300">
          <Activity size={30} />
        </div>
        <h1 className="text-xl font-black">Noir</h1>
        <p className="mt-3 leading-7 text-zinc-400">
          این ابزار برای استفاده در موبایل طراحی شده است. لطفاً با گوشی وارد
          شوید.
        </p>
      </div>
    </div>
  );
}
