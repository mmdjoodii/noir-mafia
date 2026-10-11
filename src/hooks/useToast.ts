import { useEffect, useState } from "react";

/** پیام کوتاه پایین صفحه که بعد از چند ثانیه خودکار پاک می‌شود. */
export function useToast(duration = 2300) {
  const [toast, setToast] = useState("");
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), duration);
    return () => window.clearTimeout(timer);
  }, [toast, duration]);
  return { toast, setToast };
}
