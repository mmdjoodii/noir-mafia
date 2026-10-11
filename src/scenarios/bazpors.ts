import type { Role, RoleSlot, Scenario } from "../domain/types";

const img = (name: string) => `${import.meta.env.BASE_URL}cards/${name}.webp`;

export const bazporsRoles: Role[] = [
  {
    id: "godfather",
    name: "گادفادر",
    side: "mafia",
    cardImage: img("godfather"),
  },
  { id: "trickster", name: "شیاد", side: "mafia", cardImage: img("trickster") },
  { id: "nato", name: "ناتو", side: "mafia", cardImage: img("nato") },
  {
    id: "simple-mafia",
    name: "مافیا ساده",
    side: "mafia",
    cardImage: img("simple-mafia"),
  },
  { id: "hunter", name: "محقق", side: "citizen", cardImage: img("hunter") },
  {
    id: "detective",
    name: "کارآگاه",
    side: "citizen",
    cardImage: img("detective"),
  },
  {
    id: "physician",
    name: "دکتر",
    side: "citizen",
    cardImage: img("physician"),
  },
  {
    id: "investigator",
    name: "بازپرس",
    side: "citizen",
    cardImage: img("investigator"),
  },
  {
    id: "invulnerable",
    name: "رویین‌تن",
    side: "citizen",
    cardImage: img("invulnerable"),
  },
  { id: "sniper", name: "اسنایپر", side: "citizen", cardImage: img("sniper") },
];

const core: RoleSlot[] = [
  { roleId: "godfather", count: 1 },
  { roleId: "trickster", count: 1 },
  { roleId: "nato", count: 1 },
  { roleId: "hunter", count: 1 },
  { roleId: "detective", count: 1 },
  { roleId: "physician", count: 1 },
  { roleId: "investigator", count: 1 },
  { roleId: "invulnerable", count: 1 },
];
const extra: RoleSlot[] = [
  { roleId: "sniper", count: 1 },
  { roleId: "simple-mafia", count: 1 },
];

const make = (playerCount: number, roles: RoleSlot[]): Scenario => ({
  id: `bazpors-${playerCount}`,
  family: { id: "bazpors", name: "بازپرس" },
  name: `بازپرس ${playerCount.toLocaleString("fa-IR")} نفره`,
  roles,
  settings: { initialHp: 0, playerCount, hp: false },
});

export const bazpors10 = make(10, [
  ...core,
  { roleId: "simple-citizen", count: 2 },
]);
export const bazpors12 = make(12, [
  ...core,
  ...extra,
  { roleId: "simple-citizen", count: 2 },
]);
export const bazpors13 = make(13, [
  ...core,
  ...extra,
  { roleId: "simple-citizen", count: 3 },
]);
