import { asc } from "drizzle-orm";
import { db, isDatabaseConfigured } from "../src/db/index.ts";
import {
  foods,
  mapAreas,
  pandals,
  pandalTags,
  settings,
  starts,
  timeOptions,
  travelModes,
  vibes,
} from "../src/db/schema.ts";
import { SEED_DATA } from "./seed-data";
import type { Crowd, EngineConfig, PandalPassData, Prefs, SiteConfig } from "./types";

const CACHE_MS = 30_000;

let cache: { data: PandalPassData; expires: number } | null = null;
let pending: Promise<PandalPassData> | null = null;
let warned = false;

function setting<T>(settingsMap: Record<string, unknown>, name: string): T {
  const value = settingsMap[name];
  return (typeof value === "string" ? JSON.parse(value) : value) as T;
}

async function readFromDatabase(): Promise<PandalPassData> {
  try {
    const [
      pandalRows,
      tagRows,
      startRows,
      foodRows,
      vibeRows,
      timeRows,
      modeRows,
      areaRows,
      settingRows,
    ] = await Promise.all([
      db.select().from(pandals).orderBy(asc(pandals.id)),
      db.select().from(pandalTags).orderBy(asc(pandalTags.pandalId), asc(pandalTags.position)),
      db.select().from(starts).orderBy(asc(starts.position)),
      db.select().from(foods).orderBy(asc(foods.position)),
      db.select().from(vibes).orderBy(asc(vibes.position)),
      db.select().from(timeOptions).orderBy(asc(timeOptions.hours)),
      db.select().from(travelModes).orderBy(asc(travelModes.position)),
      db.select().from(mapAreas).orderBy(asc(mapAreas.position)),
      db.select().from(settings),
    ]);

    if (!pandalRows.length || !startRows.length || settingRows.length < 7) {
      throw new Error("Cloud SQL catalog tables are empty or incomplete.");
    }

    const tagsByPandal = new Map<number, string[]>();
    for (const row of tagRows) {
      const tags = tagsByPandal.get(row.pandalId) ?? [];
      tags.push(row.tag);
      tagsByPandal.set(row.pandalId, tags);
    }

    const settingsMap: Record<string, unknown> = {};
    for (const row of settingRows) {
      settingsMap[row.name] = row.value;
    }

    return {
      site: setting<SiteConfig>(settingsMap, "site"),
      defaultPrefs: setting<Prefs>(settingsMap, "defaultPrefs"),
      home: setting<PandalPassData["home"]>(settingsMap, "home"),
      pandalGlyphs: setting<string[]>(settingsMap, "pandalGlyphs"),
      crowdLabels: setting<Record<Crowd, string>>(settingsMap, "crowdLabels"),
      tagLabels: setting<Record<string, string>>(settingsMap, "tagLabels"),
      pandals: pandalRows.map((row) => ({
        id: Number(row.id),
        name: row.name,
        area: row.area,
        tagline: row.tagline,
        tags: tagsByPandal.get(row.id) ?? [],
        crowd: row.crowd,
        x: Number(row.x),
        y: Number(row.y),
      })),
      starts: startRows.map((row) => ({
        name: row.name,
        x: Number(row.x),
        y: Number(row.y),
      })),
      foods: foodRows.map((row) => ({
        id: row.id,
        icon: row.icon,
        name: row.name,
        kind: row.kind,
        area: row.area,
        price: Number(row.price),
      })),
      vibes: vibeRows.map((row) => ({
        id: row.id,
        icon: row.icon,
        label: row.label,
      })),
      times: timeRows.map((row) => ({
        hours: Number(row.hours),
        count: Number(row.count),
      })),
      modes: modeRows.map((row) => ({
        id: row.id,
        icon: row.icon,
        label: row.label,
      })),
      engine: setting<EngineConfig>(settingsMap, "engine"),
      mapAreas: areaRows.map((row) => ({
        label: row.label,
        x: Number(row.x),
        y: Number(row.y),
      })),
    } satisfies PandalPassData;
  } catch (error) {
    throw new Error("Database query failed while loading catalog data.", { cause: error });
  }
}

async function load(): Promise<PandalPassData> {
  if (!isDatabaseConfigured()) {
    return SEED_DATA;
  }
  try {
    return await readFromDatabase();
  } catch (error) {
    if (!warned) {
      warned = true;
      console.warn(`[pandalpass] Cloud SQL read failed, using bundled seed data: ${(error as Error).message}`);
    }
    return SEED_DATA;
  }
}

export async function getProductData(): Promise<PandalPassData> {
  if (!isDatabaseConfigured()) {
    return SEED_DATA;
  }
  if (cache && cache.expires > Date.now()) {
    return cache.data;
  }
  if (!pending) {
    pending = load()
      .then((data) => {
        cache = { data, expires: Date.now() + CACHE_MS };
        return data;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}
