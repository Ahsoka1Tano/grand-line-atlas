import type { Rarity } from "@/content/cards";

export const BOX = {
  id: "east-blue",
  name: "The First Voyage",
  price: 250,
  cardCount: 3,
  poolVersion: "east-blue-1",
  rarityWeights: { C: 6000, R: 2800, SR: 1000, SSR: 200 } satisfies Record<Rarity, number>,
} as const;
export const STARTING_BERRIES = 1000;
export const DAILY_BERRIES = 250;
export const STARTER_EDITIONS = ["eb-004-c", "eb-007-c", "eb-008-c", "eb-009-c", "eb-010-c"];

export type CardInstance = {
  id: string;
  editionId: string;
  characterId: string;
  bound: boolean;
  acquiredAt: string;
};
export type CrewSlot = {
  position: number;
  instanceId: string;
  characterId: string;
  battle: boolean;
};
export type OpeningResult = {
  id: string;
  createdAt: string;
  editionIds: string[];
  instanceIds: string[];
  cost: number;
  poolVersion: string;
};
export type GameSnapshot = {
  profile: { id: string; name: string; createdAt: string; crewRevision: number };
  wallet: { berries: number; freeBoxes: number };
  instances: CardInstance[];
  favoriteEditionIds: string[];
  crew: CrewSlot[];
  openings: OpeningResult[];
  daily: { available: boolean; reward: number; nextResetAt: string };
};

export class GameError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
