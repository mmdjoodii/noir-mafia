import { useState } from "react";
import type { Role } from "../domain/types";

/** تصویر کارت نقش؛ اگر فایل تصویر هنوز اضافه نشده باشد، یک جای‌گزین با نام نقش نشان می‌دهد. */
export function RoleImage({
  role,
  className = "",
  big = false,
}: {
  role: Role;
  className?: string;
  big?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState("");
  if (failedSrc === role.cardImage) {
    return (
      <div
        role="img"
        aria-label={role.name}
        className={`${className} grid place-items-center overflow-hidden bg-gradient-to-br from-violet-950 to-[#14131e] p-1 text-center font-bold leading-tight text-violet-200 ${big ? "text-2xl" : "text-[9px]"}`}
      >
        {role.name}
      </div>
    );
  }
  return (
    <img
      src={role.cardImage}
      alt=""
      className={className}
      draggable={false}
      onError={() => setFailedSrc(role.cardImage)}
    />
  );
}
