import type { Assignment, Player, Scenario } from "./types";
export function buildRoleDeck(scenario: Scenario): string[] {
  return scenario.roles.flatMap(({ roleId, count }) =>
    Array.from({ length: count }, () => roleId),
  );
}
export function canAssignRole(
  scenario: Scenario,
  currentRoleIds: string[],
  roleId: string,
  playerCount: number,
): boolean {
  const max = scenario.roles.find((r) => r.roleId === roleId)?.count ?? 0;
  return (
    currentRoleIds.length < playerCount &&
    currentRoleIds.filter((id) => id === roleId).length < max
  );
}
export function makeAssignments(
  players: Player[],
  roleIds: string[],
  initialHp: number,
): Assignment[] {
  return players.flatMap((player, index) =>
    roleIds[index]
      ? [
          {
            playerId: player.id,
            roleId: roleIds[index],
            hp: initialHp,
            status: "alive" as const,
          },
        ]
      : [],
  );
}
