import { useState } from "react";

/** state پنل تغییر HP: بازیکن هدف، مقدار، علت، حالت کسر/افزایش و رولت. */
export function useHpForm() {
  const [hpPlayerId, setHpPlayerId] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [selectedCauseId, setSelectedCauseId] = useState("");
  const [roulettePartnerId, setRoulettePartnerId] = useState("");
  const [customMode, setCustomMode] = useState<"damage" | "heal">("damage");

  /** باز کردن پنل برای یک بازیکن با فرم تمیز */
  const openPlayer = (id: string) => {
    setHpPlayerId(id);
    setCustomMode("damage");
    setRoulettePartnerId("");
  };
  /** بعد از ثبت موفق تغییر */
  const clearInputs = () => {
    setCustomAmount("");
    setCustomReason("");
    setSelectedCauseId("");
  };
  return {
    hpPlayerId,
    setHpPlayerId,
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
    openPlayer,
    clearInputs,
  };
}
