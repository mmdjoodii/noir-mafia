import { useEffect, useMemo, useState } from "react";
import type { Game, Phase, Player } from "./domain/types";
import {
  applyHpChange,
  lowHpAlarm,
  lowestHpPlayers,
  pendingAnnouncements,
  undoLastHpChange,
} from "./domain/hp";
import { makeId } from "./domain/id";
import {
  buildRoleDeck,
  canAssignRole,
  makeAssignments,
} from "./domain/roleAssignment";
import { loadGame, saveGame } from "./state/storage";
import { damageScenario } from "./scenarios/damage";
import { getScenario } from "./scenarios";
import { initialNames, type Screen } from "./lib/format";
import { shuffled } from "./lib/random";
import { AppHeader } from "./components/AppHeader";
import { DesktopNotice } from "./components/DesktopNotice";
import { HpSheet } from "./components/HpSheet";
import { PlayerListSheet } from "./components/PlayerListSheet";
import { AnnouncementDialog } from "./components/AnnouncementDialog";
import { ResetDialog } from "./components/ResetDialog";
import { SetupScreen } from "./screens/SetupScreen";
import { DealScreen } from "./screens/DealScreen";
import { RevealScreen } from "./screens/RevealScreen";
import { GameScreen } from "./screens/GameScreen";
import { HistoryScreen } from "./screens/HistoryScreen";

const saved = loadGame();

export default function App() {
  const [game, setGame] = useState<Game | null>(saved);
  const [screen, setScreen] = useState<Screen>(() => {
    return saved?.status === "running"
      ? "game"
      : saved?.status === "dealing"
        ? saved.dealMode === "random" && saved.assignments.length > 0
          ? "reveal"
          : "deal"
        : "setup";
  });
  const [names, setNames] = useState<string[]>(
    () => saved?.players.map((p) => p.name) ?? initialNames,
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState(
    () => saved?.selectedPlayerId ?? "",
  );
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [revealedRoleId, setRevealedRoleId] = useState(() => {
    return (
      saved?.assignments.find((a) => a.playerId === saved.selectedPlayerId)
        ?.roleId ?? ""
    );
  });
  const [showCard, setShowCard] = useState(false);
  const [hpPlayerId, setHpPlayerId] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [selectedCauseId, setSelectedCauseId] = useState("");
  const [roulettePartnerId, setRoulettePartnerId] = useState("");
  const [customMode, setCustomMode] = useState<"damage" | "heal">("damage");
  const [listKind, setListKind] = useState<"dead" | "coma" | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [toast, setToast] = useState("");
  const [phaseMenu, setPhaseMenu] = useState(false);
  const [randomDealing, setRandomDealing] = useState(() => {
    return saved?.status === "dealing" && saved.dealMode === "random";
  });
  const [randomRevealQueue, setRandomRevealQueue] = useState<string[]>(
    () => saved?.revealQueue ?? [],
  );

  useEffect(() => {
    saveGame(game);
  }, [game]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2300);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const scenario = getScenario(game?.scenarioId ?? "") ?? damageScenario;
  const players = game?.players ?? [];
  const assignments = useMemo(() => game?.assignments ?? [], [game]);
  const assignedCount = assignments.length;
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    assignments.forEach((a) => {
      counts[a.roleId] = (counts[a.roleId] ?? 0) + 1;
    });
    return counts;
  }, [assignments]);
  const selectedPlayer = players.find((p) => p.id === hpPlayerId);
  const selectedAssignment = assignments.find((a) => a.playerId === hpPlayerId);
  const hpEvents = game?.hpEvents ?? [];
  const aliveCount = assignments.filter((a) => a.status === "alive").length;
  const pending = game ? pendingAnnouncements(game) : [];
  const comaCount = assignments.filter((a) => a.status === "coma").length;
  const alarm = game ? lowHpAlarm(game) : { active: false, low: 0, total: 0 };
  const lowest = game ? lowestHpPlayers(game) : [];
  const listPlayers = assignments.filter((a) => a.status === listKind);
  const openHp = (id: string) => {
    setHpPlayerId(id);
    setCustomMode("damage");
    setRoulettePartnerId("");
  };
  const deadCount = assignments.filter((a) => a.status === "dead").length;

  function startGame() {
    const cleaned = names.map((n, i) => n.trim() || `بازیکن ${i + 1}`);
    const p: Player[] = cleaned.map((name) => ({ id: makeId(), name }));
    const next: Game = {
      id: makeId(),
      scenarioId: damageScenario.id,
      players: p,
      assignments: [],
      phase: { kind: "intro-day", number: 0 },
      status: "dealing",
      hpEvents: [],
      dealMode: "manual",
    };
    setGame(next);
    setScreen("deal");
    setSelectedPlayerId(p[0].id);
    setSelectedRoleId("");
    setToast("بازیکنان ثبت شدند");
  }

  function assignRole() {
    if (!game || !selectedPlayerId || !selectedRoleId) return;
    if (assignments.some((a) => a.playerId === selectedPlayerId)) {
      setToast("این بازیکن نقش دریافت کرده است");
      return;
    }
    const used = assignments.map((a) => a.roleId);
    if (!canAssignRole(scenario, used, selectedRoleId, players.length)) {
      setToast("ظرفیت این نقش تکمیل شده است");
      return;
    }
    const roleIds = [...used, selectedRoleId];
    const newAssignment = makeAssignments(
      [players.find((p) => p.id === selectedPlayerId)!],
      [selectedRoleId],
      scenario.settings.initialHp,
    )[0];
    setGame({
      ...game,
      assignments: [...assignments, newAssignment],
      status: roleIds.length === players.length ? "running" : "dealing",
    });
    setRevealedRoleId(selectedRoleId);
    setShowCard(false);
    setScreen("reveal");
  }

  function startRandomDealing() {
    if (!game || assignments.length > 0) return;
    const playerOrder = shuffled(players);
    const roleIds = shuffled(buildRoleDeck(scenario));
    const allAssignments = makeAssignments(
      playerOrder,
      roleIds,
      scenario.settings.initialHp,
    );
    setGame({
      ...game,
      assignments: allAssignments,
      status: "dealing",
      phase: { kind: "intro-day", number: 0 },
      dealMode: "random",
      selectedPlayerId: playerOrder[0]?.id,
      revealQueue: playerOrder.slice(1).map((player) => player.id),
    });
    const queue = playerOrder.map((player) => player.id);
    setRandomRevealQueue(queue.slice(1));
    setRandomDealing(true);
    setSelectedPlayerId(queue[0] ?? "");
    setRevealedRoleId(
      allAssignments.find((a) => a.playerId === queue[0])?.roleId ?? "",
    );
    setShowCard(false);
    setScreen("reveal");
    setToast("نقش‌ها به‌صورت تصادفی تخصیص داده شدند");
  }

  function finishReveal() {
    setShowCard(false);
    if (!game) return;
    if (randomDealing) {
      const nextPlayerId = randomRevealQueue[0];
      if (nextPlayerId) {
        setRandomRevealQueue((queue) => queue.slice(1));
        setSelectedPlayerId(nextPlayerId);
        setGame({
          ...game,
          selectedPlayerId: nextPlayerId,
          revealQueue: randomRevealQueue.slice(1),
        });
        setRevealedRoleId(
          game.assignments.find((a) => a.playerId === nextPlayerId)?.roleId ??
            "",
        );
        return;
      }
      setRandomDealing(false);
      setRandomRevealQueue([]);
      setRevealedRoleId("");
      setGame({
        ...game,
        status: "running",
        phase: { kind: "intro-day", number: 0 },
        dealMode: undefined,
        selectedPlayerId: undefined,
        revealQueue: undefined,
      });
      setScreen("game");
      setToast("تقسیم نقش‌ها کامل شد؛ روز معارفه شروع شد");
      return;
    }
    setRevealedRoleId("");
    const nextUnassigned = players.find(
      (p) => !game.assignments.some((a) => a.playerId === p.id),
    );
    if (nextUnassigned) {
      setSelectedPlayerId(nextUnassigned.id);
      setSelectedRoleId("");
      setScreen("deal");
    } else {
      setGame({
        ...game,
        status: "running",
        phase: { kind: "intro-day", number: 0 },
      });
      setScreen("game");
      setToast("روز معارفه شروع شد");
    }
  }

  function restartDealing() {
    if (!game) return;
    setGame({
      ...game,
      assignments: [],
      hpEvents: [],
      status: "dealing",
      phase: { kind: "intro-day", number: 0 },
      dealMode: "manual",
      selectedPlayerId: players[0]?.id,
      revealQueue: undefined,
    });
    setRandomDealing(false);
    setRandomRevealQueue([]);
    setSelectedPlayerId(players[0]?.id ?? "");
    setSelectedRoleId("");
    setConfirmReset(false);
    setScreen("deal");
    setToast("تقسیم نقش از ابتدا شروع شد");
  }

  function changeHp(delta: number, reason = "") {
    if (!game || !hpPlayerId) return;
    const next = applyHpChange(game, hpPlayerId, delta, reason);
    if (next === game) {
      setToast("تغییری اعمال نشد");
      return;
    }
    setGame(next);
    setCustomAmount("");
    setCustomReason("");
    setSelectedCauseId("");
    const a = next.assignments.find((item) => item.playerId === hpPlayerId);
    setToast(
      a?.status === "dead"
        ? "HP به صفر یا کمتر رسید؛ بازیکن مرد"
        : a?.status === "coma"
          ? "HP دقیقاً صفر شد؛ بازیکن در کما رفت"
          : `HP جدید: ${a?.hp}`,
    );
  }

  function applyRoulette() {
    if (
      !game ||
      !hpPlayerId ||
      !roulettePartnerId ||
      roulettePartnerId === hpPlayerId
    ) {
      setToast("بازیکن دوم رولت را انتخاب کن");
      return;
    }
    const first = game.assignments.find((a) => a.playerId === hpPlayerId);
    const second = game.assignments.find(
      (a) => a.playerId === roulettePartnerId,
    );
    const firstPlayer = game.players.find((p) => p.id === hpPlayerId);
    const secondPlayer = game.players.find((p) => p.id === roulettePartnerId);
    if (!first || !second || !firstPlayer || !secondPlayer) return;
    const sharedHp = (first.hp + second.hp) / 2;
    const reason = `رولت روسی: میانگین HP با ${secondPlayer.name}`;
    let next = applyHpChange(game, hpPlayerId, sharedHp - first.hp, reason);
    next = applyHpChange(
      next,
      roulettePartnerId,
      sharedHp - second.hp,
      `رولت روسی: میانگین HP با ${firstPlayer.name}`,
    );
    if (next === game) {
      setToast("HP دو بازیکن از قبل برابر است");
      return;
    }
    setGame(next);
    setCustomReason("");
    setSelectedCauseId("");
    setToast(`HP هر دو بازیکن به ${sharedHp} رسید`);
  }

  function undoHp() {
    if (!game || !hpPlayerId) return;
    const next = undoLastHpChange(game, hpPlayerId);
    if (next === game) {
      setToast("تغییری برای بازگردانی وجود ندارد");
      return;
    }
    setGame(next);
    setToast("آخرین تغییر HP بازگردانده شد");
  }

  function setPhase(phase: Phase) {
    if (!game) return;
    setGame({ ...game, phase });
    setPhaseMenu(false);
  }

  function confirmResetAction() {
    if (screen === "deal") restartDealing();
    else {
      setGame(null);
      setNames(initialNames);
      setScreen("setup");
      setHpPlayerId("");
      setConfirmReset(false);
    }
  }

  return (
    <>
      <div className="mobile-shell block sm:hidden">
        <AppHeader game={game} />

        {screen === "setup" && (
          <SetupScreen
            names={names}
            setNames={setNames}
            startGame={startGame}
          />
        )}

        {screen === "deal" && game && (
          <DealScreen
            players={players}
            assignments={assignments}
            assignedCount={assignedCount}
            startRandomDealing={startRandomDealing}
            assignRole={assignRole}
            selectedPlayerId={selectedPlayerId}
            setSelectedPlayerId={setSelectedPlayerId}
            selectedRoleId={selectedRoleId}
            setSelectedRoleId={setSelectedRoleId}
            scenario={scenario}
            roleCounts={roleCounts}
            setConfirmReset={setConfirmReset}
          />
        )}

        {screen === "reveal" && (
          <RevealScreen
            players={players}
            finishReveal={finishReveal}
            selectedPlayerId={selectedPlayerId}
            revealedRoleId={revealedRoleId}
            showCard={showCard}
            setShowCard={setShowCard}
          />
        )}

        {screen === "game" && game && (
          <GameScreen
            game={game}
            players={players}
            assignments={assignments}
            setConfirmReset={setConfirmReset}
            phaseMenu={phaseMenu}
            setPhaseMenu={setPhaseMenu}
            setPhase={setPhase}
            setGame={setGame}
            alarm={alarm}
            lowest={lowest}
            openHp={openHp}
            aliveCount={aliveCount}
            comaCount={comaCount}
            deadCount={deadCount}
            setListKind={setListKind}
            setScreen={setScreen}
            setHpPlayerId={setHpPlayerId}
            setRoulettePartnerId={setRoulettePartnerId}
            setCustomMode={setCustomMode}
          />
        )}

        {screen === "history" && game && (
          <HistoryScreen
            players={players}
            setScreen={setScreen}
            hpEvents={hpEvents}
          />
        )}

        {game &&
          hpPlayerId &&
          selectedPlayer &&
          selectedAssignment &&
          screen === "game" && (
            <HpSheet
              game={game}
              players={players}
              assignments={assignments}
              undoHp={undoHp}
              applyRoulette={applyRoulette}
              hpPlayerId={hpPlayerId}
              setHpPlayerId={setHpPlayerId}
              selectedPlayer={selectedPlayer}
              selectedAssignment={selectedAssignment}
              customAmount={customAmount}
              setCustomAmount={setCustomAmount}
              customReason={customReason}
              setCustomReason={setCustomReason}
              selectedCauseId={selectedCauseId}
              setSelectedCauseId={setSelectedCauseId}
              roulettePartnerId={roulettePartnerId}
              setRoulettePartnerId={setRoulettePartnerId}
              customMode={customMode}
              setCustomMode={setCustomMode}
              changeHp={changeHp}
            />
          )}

        {listKind && screen === "game" && (
          <PlayerListSheet
            players={players}
            openHp={openHp}
            setListKind={setListKind}
            listKind={listKind}
            listPlayers={listPlayers}
          />
        )}
        {screen === "game" && game && pending.length > 0 && (
          <AnnouncementDialog
            game={game}
            players={players}
            setGame={setGame}
            pending={pending}
          />
        )}
        {confirmReset && (
          <ResetDialog
            onCancel={() => setConfirmReset(false)}
            onConfirm={confirmResetAction}
          />
        )}
        {toast && (
          <div
            role="status"
            className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#252631] px-4 py-3 text-xs font-bold shadow-2xl"
          >
            {toast}
          </div>
        )}
        <div className="safe-bottom" />
      </div>
      <DesktopNotice />
    </>
  );
}
