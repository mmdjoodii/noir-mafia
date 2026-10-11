import type { Dispatch, SetStateAction } from "react";
import type { Assignment, Game, Phase, Player, Scenario } from "../types";
import {
  changeDamageHp,
  applyDamageRoulette,
  undoDamageHp,
} from "../scenarios/damage/actions";
import { makeId } from "../utils/id";
import { setPlayerStatus } from "../game/status";
import {
  buildRoleDeck,
  canAssignRole,
  makeAssignments,
} from "../game/roleAssignment";
import { shuffled } from "../utils/random";
import { defaultNames, type Screen } from "../utils/format";
import { getScenario } from "../scenarios";

type Setter<T> = Dispatch<SetStateAction<T>>;

interface UseGameActionsOptions {
  game: Game | null;
  setGame: Setter<Game | null>;
  screen: Screen;
  setScreen: Setter<Screen>;
  scenario: Scenario;
  setupScenarioId: string;
  setSetupScenarioId: Setter<string>;
  names: string[];
  setNames: Setter<string[]>;
  players: Player[];
  assignments: Assignment[];
  selectedPlayerId: string;
  setSelectedPlayerId: Setter<string>;
  selectedRoleId: string;
  setSelectedRoleId: Setter<string>;
  setRevealedRoleId: Setter<string>;
  setShowCard: Setter<boolean>;
  randomDealing: boolean;
  setRandomDealing: Setter<boolean>;
  randomRevealQueue: string[];
  setRandomRevealQueue: Setter<string[]>;
  hpPlayerId: string;
  setHpPlayerId: Setter<string>;
  roulettePartnerId: string;
  setCustomReason: Setter<string>;
  setSelectedCauseId: Setter<string>;
  clearInputs: () => void;
  setConfirmReset: Setter<boolean>;
  setToast: Setter<string>;
  setPhaseMenu: Setter<boolean>;
}

/** Orchestrates user actions; scenario-specific HP operations stay in the Damage module. */
export function useGameActions(options: UseGameActionsOptions) {
  const {
    game,
    setGame,
    screen,
    setScreen,
    scenario,
    setupScenarioId,
    setSetupScenarioId,
    names,
    setNames,
    players,
    assignments,
    selectedPlayerId,
    setSelectedPlayerId,
    selectedRoleId,
    setSelectedRoleId,
    setRevealedRoleId,
    setShowCard,
    randomDealing,
    setRandomDealing,
    randomRevealQueue,
    setRandomRevealQueue,
    hpPlayerId,
    setHpPlayerId,
    roulettePartnerId,
    setCustomReason,
    setSelectedCauseId,
    clearInputs,
    setConfirmReset,
    setToast,
    setPhaseMenu,
  } = options;

  function selectScenario(id: string) {
    const next = getScenario(id);
    if (!next) return;
    setSetupScenarioId(id);
    setNames((old) =>
      Array.from(
        { length: next.settings.playerCount },
        (_, i) => old[i] ?? `بازیکن ${i + 1}`,
      ),
    );
  }

  function startGame() {
    const cleaned = Array.from(
      { length: scenario.settings.playerCount },
      (_, i) => names[i]?.trim() || `بازیکن ${i + 1}`,
    );
    if (new Set(cleaned).size !== cleaned.length) {
      setToast("نام بازیکنان نباید تکراری باشد");
      return;
    }
    const nextPlayers: Player[] = cleaned.map((name) => ({
      id: makeId(),
      name,
    }));
    const next: Game = {
      id: makeId(),
      scenarioId: scenario.id,
      players: nextPlayers,
      assignments: [],
      phase: { kind: "intro-day", number: 0 },
      status: "dealing",
      hpEvents: [],
      dealMode: "manual",
    };
    setGame(next);
    setScreen("deal");
    setSelectedPlayerId(nextPlayers[0].id);
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
    const player = players.find((p) => p.id === selectedPlayerId);
    if (!player) return;
    const newAssignment = makeAssignments(
      [player],
      [selectedRoleId],
      scenario.settings.initialHp,
    )[0];
    setGame({
      ...game,
      assignments: [...assignments, newAssignment],
      status: "dealing",
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
    const queue = playerOrder.map((player) => player.id);
    setGame({
      ...game,
      assignments: allAssignments,
      status: "dealing",
      phase: { kind: "intro-day", number: 0 },
      dealMode: "random",
      selectedPlayerId: playerOrder[0]?.id,
      revealQueue: playerOrder.slice(1).map((player) => player.id),
    });
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
        const remaining = randomRevealQueue.slice(1);
        setRandomRevealQueue(remaining);
        setSelectedPlayerId(nextPlayerId);
        setGame({
          ...game,
          selectedPlayerId: nextPlayerId,
          revealQueue: remaining,
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

  function beginGame() {
    if (!game) return;
    setGame({
      ...game,
      status: "running",
      phase: { kind: "intro-day", number: 0 },
    });
    setScreen("game");
    setToast("روز معارفه شروع شد");
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
    const next = changeDamageHp(game, hpPlayerId, delta, reason);
    if (next === game) {
      setToast("تغییری اعمال نشد");
      return;
    }
    setGame(next);
    clearInputs();
    const assignment = next.assignments.find(
      (item) => item.playerId === hpPlayerId,
    );
    setToast(
      assignment?.status === "dead"
        ? "HP به صفر یا کمتر رسید؛ بازیکن مرد"
        : assignment?.status === "coma"
          ? "HP دقیقاً صفر شد؛ بازیکن در کما رفت"
          : `HP جدید: ${assignment?.hp}`,
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
    const next = applyDamageRoulette(game, hpPlayerId, roulettePartnerId);
    if (next === game) {
      setToast("HP دو بازیکن از قبل برابر است یا انتخاب‌ها معتبر نیستند");
      return;
    }
    const first = next.assignments.find((a) => a.playerId === hpPlayerId);
    setGame(next);
    setCustomReason("");
    setSelectedCauseId("");
    setToast(`HP هر دو بازیکن به ${first?.hp ?? ""} رسید`);
  }

  function undoHp() {
    if (!game || !hpPlayerId) return;
    const next = undoDamageHp(game, hpPlayerId);
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
      setSetupScenarioId(scenario.id || setupScenarioId);
      setNames(defaultNames(scenario.settings.playerCount));
      setScreen("setup");
      setHpPlayerId("");
      setConfirmReset(false);
    }
  }

  function setPlayerStatusForCurrentGame(
    playerId: string,
    status: Assignment["status"],
  ) {
    setGame((current) => {
      if (!current) return current;
      if (status !== "coma") return setPlayerStatus(current, playerId, status);

      return {
        ...current,
        assignments: current.assignments.map((assignment) =>
          assignment.playerId === playerId
            ? { ...assignment, status }
            : assignment,
        ),
      };
    });
  }

  return {
    selectScenario,
    startGame,
    assignRole,
    startRandomDealing,
    finishReveal,
    beginGame,
    changeHp,
    applyRoulette,
    undoHp,
    setPhase,
    confirmResetAction,
    setPlayerStatusForCurrentGame,
  };
}
