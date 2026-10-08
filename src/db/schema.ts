import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";
import type { CharacterCard } from "@/content/cards";

export const profiles = pgTable("gla_profiles", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 24 }).notNull(),
  crewRevision: integer("crew_revision").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const wallets = pgTable("gla_wallets", {
  profileId: uuid("profile_id")
    .primaryKey()
    .references(() => profiles.id),
  berries: integer("berries").notNull(),
  freeBoxes: integer("free_boxes").notNull(),
});
export const editions = pgTable("gla_editions", {
  id: text("id").primaryKey(),
  characterId: text("character_id").notNull(),
  payload: jsonb("payload").$type<CharacterCard>().notNull(),
});
export const openings = pgTable(
  "gla_openings",
  {
    id: uuid("id").primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id),
    requestKey: uuid("request_key").notNull(),
    cost: integer("cost").notNull(),
    editionIds: jsonb("edition_ids").$type<string[]>().notNull(),
    instanceIds: jsonb("instance_ids").$type<string[]>().notNull(),
    poolVersion: text("pool_version").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("gla_opening_request").on(table.profileId, table.requestKey)],
);
export const instances = pgTable("gla_instances", {
  id: uuid("id").primaryKey(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  editionId: text("edition_id")
    .notNull()
    .references(() => editions.id),
  characterId: text("character_id").notNull(),
  bound: boolean("bound").notNull().default(false),
  openingId: uuid("opening_id").references(() => openings.id),
  acquiredAt: timestamp("acquired_at", { withTimezone: true }).notNull().defaultNow(),
});
export const crewSlots = pgTable(
  "gla_crew",
  {
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id),
    position: integer("position").notNull(),
    instanceId: uuid("instance_id")
      .notNull()
      .references(() => instances.id),
    characterId: text("character_id").notNull(),
    battle: boolean("battle").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.profileId, table.position] }),
    unique("gla_crew_character").on(table.profileId, table.characterId),
  ],
);
export const favorites = pgTable(
  "gla_favorites",
  {
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id),
    editionId: text("edition_id")
      .notNull()
      .references(() => editions.id),
  },
  (table) => [primaryKey({ columns: [table.profileId, table.editionId] })],
);
export const walletEntries = pgTable(
  "gla_wallet_entries",
  {
    id: uuid("id").primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id),
    delta: integer("delta").notNull(),
    sourceKey: text("source_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("gla_wallet_source").on(table.profileId, table.sourceKey)],
);
export const sessions = pgTable("gla_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
