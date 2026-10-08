import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { randomUUID } from "node:crypto";
import { resolve, sep } from "node:path";
import { mkdir, rm } from "node:fs/promises";
import { eq, and } from "drizzle-orm";
import { createDatabase } from "../src/server/database";
import { GameService } from "../src/server/game-service";
import { cardCatalog } from "../src/content/cards";
import { crewSlots, wallets } from "../src/db/schema";

let handle: Awaited<ReturnType<typeof createDatabase>>;
let service: GameService;
const luffy = cardCatalog.find((card) => card.id === "eb-004-c")!;
before(async () => {
  handle = await createDatabase("memory://");
  service = new GameService(handle.db, () => [luffy, luffy, luffy]);
});
after(async () => {
  await handle?.client.close();
});

test("profile owns five bound starter characters and a three-card battle team", async () => {
  const profile = await service.createProfile();
  const state = await service.getSnapshot(profile.profileId);
  assert.equal(state.instances.length, 5);
  assert.ok(state.instances.every((card) => card.bound));
  assert.equal(new Set(state.instances.map((card) => card.characterId)).size, 5);
  assert.equal(state.wallet.berries, 1000);
  assert.equal(state.wallet.freeBoxes, 1);
  assert.equal(state.crew.filter((slot) => slot.battle).length, 3);
  assert.equal(await service.resolveSession(profile.token), profile.profileId);
  assert.equal(await service.resolveSession("invented-session"), null);
});
test("concurrent retries of one opening return the same three instances", async () => {
  const { profileId } = await service.createProfile();
  const key = randomUUID();
  const results = await Promise.all(
    Array.from({ length: 5 }, () => service.openBox(profileId, key)),
  );
  assert.equal(new Set(results.map((result) => result.id)).size, 1);
  assert.deepEqual(results[0].instanceIds, results[4].instanceIds);
  const state = await service.getSnapshot(profileId);
  assert.equal(state.instances.length, 8);
  assert.equal(state.openings.length, 1);
  assert.equal(state.wallet.berries, 1000);
  assert.equal(state.wallet.freeBoxes, 0);
});
test("parallel different openings cannot overspend a wallet", async () => {
  const { profileId } = await service.createProfile();
  const results = await Promise.allSettled(
    Array.from({ length: 9 }, () => service.openBox(profileId, randomUUID())),
  );
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 5);
  assert.equal(results.filter((result) => result.status === "rejected").length, 4);
  const state = await service.getSnapshot(profileId);
  assert.equal(state.wallet.berries, 0);
  assert.equal(state.instances.length, 20);
  assert.equal(state.openings.length, 5);
});
test("a failed instance insert rolls back the box, free credit and wallet", async () => {
  const { profileId } = await service.createProfile();
  const failing = new GameService(handle.db, () => [
    { ...luffy, id: "missing-edition" },
    luffy,
    luffy,
  ]);
  await assert.rejects(() => failing.openBox(profileId, randomUUID()));
  const state = await service.getSnapshot(profileId);
  assert.equal(state.wallet.berries, 1000);
  assert.equal(state.wallet.freeBoxes, 1);
  assert.equal(state.instances.length, 5);
  assert.equal(state.openings.length, 0);
});
test("foreign cards and repeated characters cannot replace a crew", async () => {
  const a = await service.createProfile(),
    b = await service.createProfile();
  const own = await service.getSnapshot(a.profileId),
    other = await service.getSnapshot(b.profileId);
  const slots = own.crew.map(({ characterId, ...slot }) => slot);
  await assert.rejects(
    () =>
      service.saveCrew(a.profileId, 0, [
        { ...slots[0], instanceId: other.instances[0].id },
        ...slots.slice(1),
      ]),
    { code: "CARD_NOT_OWNED" },
  );
  const opening = await service.openBox(a.profileId, randomUUID());
  await assert.rejects(
    () =>
      service.saveCrew(a.profileId, 0, [
        ...slots.slice(0, 3),
        { ...slots[3], instanceId: opening.instanceIds[0] },
        slots[4],
      ]),
    { code: "DUPLICATE_CHARACTER" },
  );
  assert.deepEqual((await service.getSnapshot(a.profileId)).crew, own.crew);
});
test("saving a stale crew revision is rejected and current data stays intact", async () => {
  const { profileId } = await service.createProfile();
  const state = await service.getSnapshot(profileId);
  const slots = state.crew.map(({ characterId, ...slot }) => ({
    ...slot,
    battle: slot.position === 0 || slot.position === 3 || slot.position === 4,
  }));
  await service.saveCrew(profileId, 0, slots);
  await assert.rejects(() => service.saveCrew(profileId, 0, slots), { code: "CREW_CHANGED" });
  const saved = await service.getSnapshot(profileId);
  assert.equal(saved.profile.crewRevision, 1);
  assert.deepEqual(
    saved.crew.filter((slot) => slot.battle).map((slot) => slot.position),
    [0, 3, 4],
  );
});
test("daily reward is awarded once per UTC date even under concurrency", async () => {
  const { profileId } = await service.createProfile();
  const date = new Date("2026-10-08T12:00:00Z");
  const results = await Promise.all(
    Array.from({ length: 6 }, () => service.claimDaily(profileId, date)),
  );
  assert.equal(results.filter(Boolean).length, 1);
  assert.equal((await service.getSnapshot(profileId)).wallet.berries, 1250);
  assert.equal(await service.claimDaily(profileId, new Date("2026-10-09T00:01:00Z")), true);
  assert.equal((await service.getSnapshot(profileId)).wallet.berries, 1500);
});
test("favorites only accept owned editions and are idempotent", async () => {
  const { profileId } = await service.createProfile();
  await service.setFavorite(profileId, luffy.id, true);
  await service.setFavorite(profileId, luffy.id, true);
  assert.deepEqual((await service.getSnapshot(profileId)).favoriteEditionIds, [luffy.id]);
  await assert.rejects(() => service.setFavorite(profileId, "eb-001-ssr", true), {
    code: "CARD_NOT_OWNED",
  });
});
test("database constraints enforce nonnegative money and crew ownership", async () => {
  const a = await service.createProfile(),
    b = await service.createProfile();
  await assert.rejects(() =>
    handle.db.update(wallets).set({ berries: -1 }).where(eq(wallets.profileId, a.profileId)),
  );
  const opening = await service.openBox(b.profileId, randomUUID());
  await assert.rejects(() =>
    handle.db
      .update(crewSlots)
      .set({ instanceId: opening.instanceIds[0], characterId: "luffy" })
      .where(and(eq(crewSlots.profileId, a.profileId), eq(crewSlots.position, 0))),
  );
  assert.equal((await service.getSnapshot(a.profileId)).wallet.berries, 1000);
});
test("filesystem PostgreSQL survives closing and reopening", async () => {
  const root = resolve(process.cwd(), "artifacts"),
    temporaryRoot = resolve(root, `persistence-${randomUUID()}`),
    directory = resolve(temporaryRoot, "nested", "postgres");
  assert.ok(directory.startsWith(root + sep));
  await mkdir(root, { recursive: true });
  let first: Awaited<ReturnType<typeof createDatabase>> | undefined, second: typeof first;
  try {
    first = await createDatabase(directory.replaceAll("\\", "/"));
    const initial = new GameService(first.db, () => [luffy, luffy, luffy]);
    const profile = await initial.createProfile("Сохранённый капитан");
    const opening = await initial.openBox(profile.profileId, randomUUID());
    await first.client.close();
    second = await createDatabase(directory.replaceAll("\\", "/"));
    const reopened = new GameService(second.db);
    assert.equal(await reopened.resolveSession(profile.token), profile.profileId);
    const state = await reopened.getSnapshot(profile.profileId);
    assert.equal(state.profile.name, "Сохранённый капитан");
    assert.equal(state.instances.length, 8);
    assert.equal(state.openings[0].id, opening.id);
  } finally {
    if (first && !first.client.closed) await first.client.close();
    if (second && !second.client.closed) await second.client.close();
    assert.ok(temporaryRoot.startsWith(root + sep));
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
