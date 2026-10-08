import "server-only";
import { PGlite } from "@electric-sql/pglite";
import { drizzle, type PgliteDatabase } from "drizzle-orm/pglite";
import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";
import { cardCatalog } from "@/content/cards";
import * as schema from "@/db/schema";
import { GAME_SCHEMA_SQL, GAME_SCHEMA_VERSION } from "@/db/migrations";

export type GameDatabase = PgliteDatabase<typeof schema>;
export async function createDatabase(dataDir: string) {
  if (!dataDir.startsWith("memory://"))
    await mkdir(/* turbopackIgnore: true */ dataDir, { recursive: true });
  const client = await PGlite.create(dataDir);
  await client.exec(
    "CREATE TABLE IF NOT EXISTS gla_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
  );
  await client.transaction(async (tx) => {
    const migration = await tx.query("SELECT name FROM gla_migrations WHERE name=$1", [
      GAME_SCHEMA_VERSION,
    ]);
    if (!migration.rows.length) {
      await tx.exec(GAME_SCHEMA_SQL);
      await tx.query("INSERT INTO gla_migrations(name) VALUES($1)", [GAME_SCHEMA_VERSION]);
    }
  });
  const db = drizzle(client, { schema });
  for (const card of cardCatalog)
    await db
      .insert(schema.editions)
      .values({ id: card.id, characterId: card.characterId, payload: card })
      .onConflictDoUpdate({ target: schema.editions.id, set: { payload: card } });
  return { db, client };
}

type DatabaseHandle = Awaited<ReturnType<typeof createDatabase>>;
const shared = globalThis as typeof globalThis & { glaDatabase?: Promise<DatabaseHandle> };
export function getDatabase() {
  if (!shared.glaDatabase) {
    const directory = resolve(
      /* turbopackIgnore: true */
      process.cwd(),
      process.env.GAME_DATA_DIR ?? ".data/postgres",
    ).replaceAll("\\", "/");
    shared.glaDatabase = createDatabase(directory).catch((error) => {
      shared.glaDatabase = undefined;
      throw error;
    });
  }
  return shared.glaDatabase;
}
