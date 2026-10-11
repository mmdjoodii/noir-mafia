import { useMemo, useState } from "react";
import { lowHpAlarm, lowestHpPlayers } from "./scenarios/damage/hp";
import { pendingAnnouncements } from "./game/phase";
import { loadGame } from "./services/storage";
import { useDealing } from "./hooks/useDealing";
import { useGameActions } from "./hooks/useGameActions";
import { AppView } from "./AppView";
import { useHpForm } from "./scenarios/damage/useHpForm";
import { usePersistedGame } from "./hooks/usePersistedGame";
import { useToast } from "./hooks/useToast";
import { damageScenario } from "./scenarios/damage";
import { getScenario } from "./scenarios";
import { defaultNames, type Screen } from "./utils/format";

const saved = loadGame();

export default function App() {
  const [game, setGame] = usePersistedGame(saved);
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
    () =>
      saved?.players.map((p) => p.name) ??
      defaultNames(damageScenario.settings.playerCount),
  );
  const {
    selectedPlayerId,
    setSelectedPlayerId,
    selectedRoleId,
    setSelectedRoleId,
    revealedRoleId,
    setRevealedRoleId,
    showCard,
    setShowCard,
    randomDealing,
    setRandomDealing,
    randomRevealQueue,
    setRandomRevealQueue,
  } = useDealing(saved);
  const {
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
  } = useHpForm();
  const [setupScenarioId, setSetupScenarioId] = useState(damageScenario.id);
  const [statusPlayerId, setStatusPlayerId] = useState("");
  const [listKind, setListKind] = useState<"dead" | "coma" | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const { toast, setToast } = useToast();
  const [phaseMenu, setPhaseMenu] = useState(false);

  const scenario =
    getScenario(game?.scenarioId ?? setupScenarioId) ?? damageScenario;
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
    if (!scenario.settings.hp) return setStatusPlayerId(id);
    openPlayer(id);
  };
  const statusPlayer = players.find((p) => p.id === statusPlayerId);
  const statusAssignment = assignments.find(
    (a) => a.playerId === statusPlayerId,
  );
  const deadCount = assignments.filter((a) => a.status === "dead").length;

  const {
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
  } = useGameActions({
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
  });

  return (
    <AppView
      game={game}
      screen={screen}
      scenario={scenario}
      names={names}
      setNames={setNames}
      selectScenario={selectScenario}
      startGame={startGame}
      players={players}
      assignments={assignments}
      assignedCount={assignedCount}
      startRandomDealing={startRandomDealing}
      beginGame={beginGame}
      assignRole={assignRole}
      selectedPlayerId={selectedPlayerId}
      setSelectedPlayerId={setSelectedPlayerId}
      selectedRoleId={selectedRoleId}
      setSelectedRoleId={setSelectedRoleId}
      roleCounts={roleCounts}
      setConfirmReset={setConfirmReset}
      finishReveal={finishReveal}
      revealedRoleId={revealedRoleId}
      showCard={showCard}
      setShowCard={setShowCard}
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
      hpEvents={hpEvents}
      hpPlayerId={hpPlayerId}
      setHpPlayerId={setHpPlayerId}
      selectedPlayer={selectedPlayer}
      selectedAssignment={selectedAssignment}
      undoHp={undoHp}
      setStatusPlayerId={setStatusPlayerId}
      applyRoulette={applyRoulette}
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
      listKind={listKind}
      listPlayers={listPlayers}
      pending={pending}
      statusPlayer={statusPlayer}
      statusAssignment={statusAssignment}
      setPlayerStatusForCurrentGame={setPlayerStatusForCurrentGame}
      confirmReset={confirmReset}
      confirmResetAction={confirmResetAction}
      toast={toast}
    />
  );
}
