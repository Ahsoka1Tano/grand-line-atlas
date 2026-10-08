import "server-only";
import { createHash, randomBytes, randomInt, randomUUID } from "node:crypto";
import { and, asc, desc, eq, gt, inArray, sql } from "drizzle-orm";
import { cardCatalog, type CharacterCard, type Rarity } from "@/content/cards";
import {
  BOX,
  DAILY_BERRIES,
  GameError,
  STARTER_EDITIONS,
  STARTING_BERRIES,
  type CrewSlot,
  type GameSnapshot,
  type OpeningResult,
} from "@/domain/game";
import {
  profiles,
  wallets,
  editions,
  instances,
  openings,
  favorites,
  crewSlots,
  walletEntries,
  sessions,
} from "@/db/schema";
import type { GameDatabase } from "./database";

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
const iso = (value: Date) => value.toISOString();
const dayKey = (date: Date) => date.toISOString().slice(0, 10);
function nextReset(date: Date) {
  const reset = new Date(date);
  reset.setUTCHours(24, 0, 0, 0);
  return reset.toISOString();
}

export function drawPack(): CharacterCard[] {
  const rarities = Object.keys(BOX.rarityWeights) as Rarity[];
  return Array.from({ length: BOX.cardCount }, () => {
    let roll = randomInt(10000);
    let rarity: Rarity = "C";
    for (const candidate of rarities) {
      if (roll < BOX.rarityWeights[candidate]) {
        rarity = candidate;
        break;
      }
      roll -= BOX.rarityWeights[candidate];
    }
    const pool = cardCatalog.filter((card) => card.rarity === rarity);
    return pool[randomInt(pool.length)];
  });
}

export class GameService {
  constructor(
    private readonly db: GameDatabase,
    private readonly draw: () => CharacterCard[] = drawPack,
  ) {}

  async resolveSession(token: string | undefined) {
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
    const [session] = await this.db
      .select()
      .from(sessions)
      .where(and(eq(sessions.tokenHash, tokenHash(token)), gt(sessions.expiresAt, new Date())))
      .limit(1);
    return session?.profileId ?? null;
  }
  async createProfile(name = "Капитан") {
    const id = randomUUID(),
      token = randomBytes(32).toString("base64url");
    await this.db.transaction(async (tx) => {
      await tx.insert(profiles).values({ id, name });
      await tx.insert(wallets).values({ profileId: id, berries: STARTING_BERRIES, freeBoxes: 1 });
      await tx
        .insert(walletEntries)
        .values({ id: randomUUID(), profileId: id, delta: STARTING_BERRIES, sourceKey: "starter" });
      const starter = STARTER_EDITIONS.map((editionId, position) => {
        const card = cardCatalog.find((candidate) => candidate.id === editionId)!;
        return {
          id: randomUUID(),
          profileId: id,
          editionId,
          characterId: card.characterId,
          bound: true,
          position,
        };
      });
      await tx.insert(instances).values(starter.map(({ position, ...instance }) => instance));
      await tx.insert(crewSlots).values(
        starter.map((instance) => ({
          profileId: id,
          position: instance.position,
          instanceId: instance.id,
          characterId: instance.characterId,
          battle: instance.position < 3,
        })),
      );
      await tx.insert(sessions).values({
        tokenHash: tokenHash(token),
        profileId: id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    });
    return { profileId: id, token };
  }

  async renewSession(token: string) {
    await this.db
      .update(sessions)
      .set({ expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
      .where(eq(sessions.tokenHash, tokenHash(token)));
  }

  async getSnapshot(profileId: string): Promise<GameSnapshot> {
    return this.db.transaction(
      async (tx) => {
        const [profile] = await tx.select().from(profiles).where(eq(profiles.id, profileId));
        const [wallet] = await tx.select().from(wallets).where(eq(wallets.profileId, profileId));
        if (!profile || !wallet)
          throw new GameError(401, "PROFILE_MISSING", "Профиль капитана недоступен.");
        const cards = await tx
          .select()
          .from(instances)
          .where(eq(instances.profileId, profileId))
          .orderBy(asc(instances.acquiredAt));
        const favoriteRows = await tx
          .select()
          .from(favorites)
          .where(eq(favorites.profileId, profileId));
        const crew = await tx
          .select()
          .from(crewSlots)
          .where(eq(crewSlots.profileId, profileId))
          .orderBy(asc(crewSlots.position));
        const history = await tx
          .select()
          .from(openings)
          .where(eq(openings.profileId, profileId))
          .orderBy(desc(openings.createdAt))
          .limit(20);
        const now = new Date();
        const claimed = await tx
          .select()
          .from(walletEntries)
          .where(
            and(
              eq(walletEntries.profileId, profileId),
              eq(walletEntries.sourceKey, `daily:${dayKey(now)}`),
            ),
          )
          .limit(1);
        return {
          profile: {
            id: profile.id,
            name: profile.name,
            createdAt: iso(profile.createdAt),
            crewRevision: profile.crewRevision,
          },
          wallet: { berries: wallet.berries, freeBoxes: wallet.freeBoxes },
          instances: cards.map((card) => ({
            id: card.id,
            editionId: card.editionId,
            characterId: card.characterId,
            bound: card.bound,
            acquiredAt: iso(card.acquiredAt),
          })),
          favoriteEditionIds: favoriteRows.map((row) => row.editionId),
          crew: crew.map(({ profileId: _, ...slot }) => slot),
          openings: history.map(({ profileId: _, requestKey: __, ...opening }) => ({
            ...opening,
            createdAt: iso(opening.createdAt),
          })),
          daily: { available: !claimed.length, reward: DAILY_BERRIES, nextResetAt: nextReset(now) },
        };
      },
      { isolationLevel: "repeatable read", accessMode: "read only" },
    );
  }

  async openBox(profileId: string, requestKey: string): Promise<OpeningResult> {
    return this.db.transaction(async (tx) => {
      const [wallet] = await tx
        .select()
        .from(wallets)
        .where(eq(wallets.profileId, profileId))
        .for("update");
      if (!wallet) throw new GameError(401, "PROFILE_MISSING", "Профиль капитана недоступен.");
      const [existing] = await tx
        .select()
        .from(openings)
        .where(and(eq(openings.profileId, profileId), eq(openings.requestKey, requestKey)))
        .limit(1);
      if (existing)
        return {
          id: existing.id,
          createdAt: iso(existing.createdAt),
          editionIds: existing.editionIds,
          instanceIds: existing.instanceIds,
          cost: existing.cost,
          poolVersion: existing.poolVersion,
        };
      const cost = wallet.freeBoxes ? 0 : BOX.price;
      if (wallet.berries < cost)
        throw new GameError(402, "INSUFFICIENT_BERRIES", "Для этого бокса не хватает Berries.");
      const cards = this.draw();
      if (cards.length !== 3) throw new Error("A box must contain three cards");
      const id = randomUUID(),
        createdAt = new Date(),
        instanceIds = cards.map(() => randomUUID());
      await tx
        .update(wallets)
        .set({ berries: wallet.berries - cost, freeBoxes: Math.max(0, wallet.freeBoxes - 1) })
        .where(eq(wallets.profileId, profileId));
      await tx.insert(openings).values({
        id,
        profileId,
        requestKey,
        cost,
        editionIds: cards.map((card) => card.id),
        instanceIds,
        poolVersion: BOX.poolVersion,
        createdAt,
      });
      await tx.insert(instances).values(
        cards.map((card, index) => ({
          id: instanceIds[index],
          profileId,
          editionId: card.id,
          characterId: card.characterId,
          openingId: id,
          bound: false,
          acquiredAt: createdAt,
        })),
      );
      if (cost)
        await tx
          .insert(walletEntries)
          .values({ id: randomUUID(), profileId, delta: -cost, sourceKey: `opening:${id}` });
      return {
        id,
        createdAt: iso(createdAt),
        editionIds: cards.map((card) => card.id),
        instanceIds,
        cost,
        poolVersion: BOX.poolVersion,
      };
    });
  }

  async setFavorite(profileId: string, editionId: string, enabled: boolean) {
    const [owned] = await this.db
      .select({ id: instances.id })
      .from(instances)
      .where(and(eq(instances.profileId, profileId), eq(instances.editionId, editionId)))
      .limit(1);
    if (!owned)
      throw new GameError(404, "CARD_NOT_OWNED", "Этой карточки пока нет в твоей коллекции.");
    if (enabled)
      await this.db.insert(favorites).values({ profileId, editionId }).onConflictDoNothing();
    else
      await this.db
        .delete(favorites)
        .where(and(eq(favorites.profileId, profileId), eq(favorites.editionId, editionId)));
  }

  async saveCrew(profileId: string, revision: number, slots: Omit<CrewSlot, "characterId">[]) {
    if (
      slots.length < 3 ||
      slots.length > 5 ||
      new Set(slots.map((slot) => slot.position)).size !== slots.length ||
      new Set(slots.map((slot) => slot.instanceId)).size !== slots.length ||
      slots.some((slot) => slot.position < 0 || slot.position > 4) ||
      slots.filter((slot) => slot.battle).length !== 3
    )
      throw new GameError(
        400,
        "INVALID_CREW",
        "Выбери от трёх до пяти персонажей и ровно три боевые карточки.",
      );
    await this.db.transaction(async (tx) => {
      const [profile] = await tx
        .select()
        .from(profiles)
        .where(eq(profiles.id, profileId))
        .for("update");
      if (!profile) throw new GameError(401, "PROFILE_MISSING", "Профиль капитана недоступен.");
      if (profile.crewRevision !== revision)
        throw new GameError(
          409,
          "CREW_CHANGED",
          "Команда изменилась в другом окне. Обнови состав и попробуй ещё раз.",
        );
      const owned = await tx
        .select()
        .from(instances)
        .where(
          and(
            eq(instances.profileId, profileId),
            inArray(
              instances.id,
              slots.map((slot) => slot.instanceId),
            ),
          ),
        );
      if (owned.length !== slots.length)
        throw new GameError(
          403,
          "CARD_NOT_OWNED",
          "В команду можно добавлять только свои карточки.",
        );
      if (new Set(owned.map((card) => card.characterId)).size !== owned.length)
        throw new GameError(
          400,
          "DUPLICATE_CHARACTER",
          "Один персонаж может занимать только одно место в команде.",
        );
      await tx.delete(crewSlots).where(eq(crewSlots.profileId, profileId));
      await tx.insert(crewSlots).values(
        slots.map((slot) => ({
          profileId,
          ...slot,
          characterId: owned.find((card) => card.id === slot.instanceId)!.characterId,
        })),
      );
      await tx
        .update(profiles)
        .set({ crewRevision: sql`${profiles.crewRevision}+1` })
        .where(eq(profiles.id, profileId));
    });
  }

  async claimDaily(profileId: string, now = new Date()) {
    return this.db.transaction(async (tx) => {
      const [wallet] = await tx
        .select()
        .from(wallets)
        .where(eq(wallets.profileId, profileId))
        .for("update");
      if (!wallet) throw new GameError(401, "PROFILE_MISSING", "Профиль капитана недоступен.");
      const sourceKey = `daily:${dayKey(now)}`;
      const [claimed] = await tx
        .select()
        .from(walletEntries)
        .where(and(eq(walletEntries.profileId, profileId), eq(walletEntries.sourceKey, sourceKey)))
        .limit(1);
      if (claimed) return false;
      await tx
        .insert(walletEntries)
        .values({ id: randomUUID(), profileId, delta: DAILY_BERRIES, sourceKey });
      await tx
        .update(wallets)
        .set({ berries: wallet.berries + DAILY_BERRIES })
        .where(eq(wallets.profileId, profileId));
      return true;
    });
  }
  async renameProfile(profileId: string, name: string) {
    await this.db.update(profiles).set({ name }).where(eq(profiles.id, profileId));
  }
}
