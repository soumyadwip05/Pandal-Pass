import { relations } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { Crowd, Pass, Prefs } from "../../lib/types.ts";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userPasses = pgTable("user_passes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  prefs: jsonb("prefs").$type<Prefs>().notNull(),
  pass: jsonb("pass").$type<Pass>().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pandals = pgTable("pandals", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  area: text("area").notNull(),
  tagline: text("tagline").notNull(),
  crowd: text("crowd").$type<Crowd>().notNull(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
});

export const pandalTags = pgTable(
  "pandal_tags",
  {
    pandalId: integer("pandal_id")
      .references(() => pandals.id, { onDelete: "cascade" })
      .notNull(),
    tag: text("tag").notNull(),
    position: integer("position").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.pandalId, table.tag] })],
);

export const starts = pgTable("starts", {
  name: text("name").primaryKey(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  position: integer("position").notNull(),
});

export const foods = pgTable("foods", {
  id: text("id").primaryKey(),
  icon: text("icon").notNull(),
  name: text("name").notNull(),
  kind: text("kind").notNull(),
  area: text("area").notNull(),
  price: integer("price").notNull(),
  position: integer("position").notNull(),
});

export const vibes = pgTable("vibes", {
  id: text("id").primaryKey(),
  icon: text("icon").notNull(),
  label: text("label").notNull(),
  position: integer("position").notNull(),
});

export const timeOptions = pgTable("time_options", {
  hours: integer("hours").primaryKey(),
  count: integer("count").notNull(),
});

export const travelModes = pgTable("travel_modes", {
  id: text("id").primaryKey(),
  icon: text("icon").notNull(),
  label: text("label").notNull(),
  position: integer("position").notNull(),
});

export const mapAreas = pgTable("map_areas", {
  label: text("label").primaryKey(),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  position: integer("position").notNull(),
});

export const settings = pgTable("settings", {
  name: text("name").primaryKey(),
  value: jsonb("value").notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
  savedPass: one(userPasses, {
    fields: [users.id],
    references: [userPasses.userId],
  }),
}));

export const userPassesRelations = relations(userPasses, ({ one }) => ({
  user: one(users, {
    fields: [userPasses.userId],
    references: [users.id],
  }),
}));

export const pandalsRelations = relations(pandals, ({ many }) => ({
  tags: many(pandalTags),
}));

export const pandalTagsRelations = relations(pandalTags, ({ one }) => ({
  pandal: one(pandals, {
    fields: [pandalTags.pandalId],
    references: [pandals.id],
  }),
}));
