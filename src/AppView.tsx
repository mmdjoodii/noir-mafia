import type { Dispatch, SetStateAction } from "react";
import type { Assignment, Game, Phase, Player, Scenario } from "./types";
import type { Screen } from "./utils/format";
import { scenarios } from "./scenarios";
import { AppHeader } from "./components/AppHeader";
import { DesktopNotice } from "./components/DesktopNotice";
import { HpSheet } from "./components/HpSheet";
import { PlayerListSheet } from "./components/PlayerListSheet";
import { AnnouncementDialog } from "./components/AnnouncementDialog";
import { ResetDialog } from "./components/ResetDialog";
import { PlayerStatusSheet } from "./components/PlayerStatusSheet";
import { SetupScreen } from "./screens/SetupScreen";
import { DealScreen } from "./screens/DealScreen";
import { RevealScreen } from "./screens/RevealScreen";
import { GameScreen } from "./screens/GameScreen";
import { HistoryScreen } from "./screens/HistoryScreen";

type Setter<T> = Dispatch<SetStateAction<T>>;
interface AppViewProps {
  game: Game | null;
  screen: Screen;
  scenario: Scenario;
  names: string[];
  setNames: Setter<string[]>;
  selectScenario: (id: string) => void;
  startGame: () => void;
  players: Player[];
  assignments: Assignment[];
  assignedCount: number;
  startRandomDealing: () => void;
  beginGame: () => void;
  assignRole: () => void;
  selectedPlayerId: string;
  setSelectedPlayerId: Setter<string>;
  selectedRoleId: string;
  setSelectedRoleId: Setter<string>;
  roleCounts: Record<string, number>;
  setConfirmReset: Setter<boolean>;
  finishReveal: () => void;
  revealedRoleId: string;
  showCard: boolean;
  setShowCard: Setter<boolean>;
  phaseMenu: boolean;
  setPhaseMenu: Setter<boolean>;
  setPhase: (phase: Phase) => void;
  setGame: Setter<Game | null>;
  alarm: { active: boolean; low: number; total: number };
  lowest: Assignment[];
  openHp: (id: string) => void;
  aliveCount: number;
  comaCount: number;
  deadCount: number;
  setListKind: Setter<"dead" | "coma" | null>;
  setScreen: Setter<Screen>;
  hpEvents: NonNullable<Game["hpEvents"]>;
  hpPlayerId: string;
  setHpPlayerId: Setter<string>;
  selectedPlayer: Player | undefined;
  selectedAssignment: Assignment | undefined;
  undoHp: () => void;
  setStatusPlayerId: Setter<string>;
  applyRoulette: () => void;
  customAmount: string;
  setCustomAmount: Setter<string>;
  customReason: string;
  setCustomReason: Setter<string>;
  selectedCauseId: string;
  setSelectedCauseId: Setter<string>;
  roulettePartnerId: string;
  setRoulettePartnerId: Setter<string>;
  customMode: "damage" | "heal";
  setCustomMode: Setter<"damage" | "heal">;
  changeHp: (delta: number, reason?: string) => void;
  listKind: "dead" | "coma" | null;
  listPlayers: Assignment[];
  pending: Assignment[];
  statusPlayer: Player | undefined;
  statusAssignment: Assignment | undefined;
  setPlayerStatusForCurrentGame: (
    playerId: string,
    status: Assignment["status"],
  ) => void;
  confirmReset: boolean;
  confirmResetAction: () => void;
  toast: string;
}

export function AppView(props: AppViewProps) {
  const {
    game,
    screen,
    scenario,
    names,
    setNames,
    selectScenario,
    startGame,
    players,
    assignments,
    assignedCount,
    startRandomDealing,
    beginGame,
    assignRole,
    selectedPlayerId,
    setSelectedPlayerId,
    selectedRoleId,
    setSelectedRoleId,
    roleCounts,
    setConfirmReset,
    finishReveal,
    revealedRoleId,
    showCard,
    setShowCard,
    phaseMenu,
    setPhaseMenu,
    setPhase,
    setGame,
    alarm,
    lowest,
    openHp,
    aliveCount,
    comaCount,
    deadCount,
    setListKind,
    setScreen,
    hpEvents,
    hpPlayerId,
    setHpPlayerId,
    selectedPlayer,
    selectedAssignment,
    undoHp,
    setStatusPlayerId,
    applyRoulette,
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
    changeHp,
    listKind,
    listPlayers,
    pending,
    statusPlayer,
    statusAssignment,
    setPlayerStatusForCurrentGame,
    confirmReset,
    confirmResetAction,
    toast,
  } = props;
  return (
    <>
      <div className="mobile-shell block sm:hidden">
        <AppHeader game={game} />

        {screen === "setup" && (
          <SetupScreen
            scenario={scenario}
            scenarios={scenarios}
            selectScenario={selectScenario}
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
            beginGame={beginGame}
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
            scenarioId={scenario.id}
            finishReveal={finishReveal}
            selectedPlayerId={selectedPlayerId}
            revealedRoleId={revealedRoleId}
            showCard={showCard}
            setShowCard={setShowCard}
          />
        )}

        {screen === "game" && game && (
          <GameScreen
            hasHp={scenario.settings.hp}
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
            hasHp={scenario.settings.hp}
            scenarioId={scenario.id}
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
        {game &&
          !scenario.settings.hp &&
          statusPlayer &&
          statusAssignment &&
          screen === "game" && (
            <PlayerStatusSheet
              player={statusPlayer}
              scenarioId={scenario.id}
              assignment={statusAssignment}
              onSetStatus={(status) =>
                setPlayerStatusForCurrentGame(statusPlayer.id, status)
              }
              onClose={() => setStatusPlayerId("")}
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
