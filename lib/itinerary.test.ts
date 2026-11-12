import test from "node:test";
import assert from "node:assert/strict";
import { SEED_DATA } from "./seed-data";
import { generatePass, normalizePrefs, pickPandals } from "./itinerary";
import { getProductData } from "./repository";
import { mapX, mapY } from "./format";

test("normalizePrefs falls back to defaults for invalid input", () => {
  const prefs = normalizePrefs(SEED_DATA, {
    start: "UnknownPlace",
    vibes: ["nonexistent"],
    hours: 99,
    mode: "helicopter",
  });
  assert.equal(prefs.start, SEED_DATA.defaultPrefs.start);
  assert.deepEqual(prefs.vibes, SEED_DATA.defaultPrefs.vibes);
  assert.equal(prefs.hours, SEED_DATA.defaultPrefs.hours);
  assert.equal(prefs.mode, SEED_DATA.defaultPrefs.mode);
  assert.equal(prefs.food, SEED_DATA.defaultPrefs.food);
});

test("seed dataset includes full upgraded 2026 catalog", () => {
  assert.equal(SEED_DATA.pandals.length, 56);
  assert.equal(SEED_DATA.starts.length, 24);
  assert.equal(SEED_DATA.foods.length, 30);
});

test("pickPandals returns expected count matching selected hours", () => {
  const start = SEED_DATA.starts[0];
  const prefs = { ...SEED_DATA.defaultPrefs, hours: 4 };
  const picked = pickPandals(prefs, start, SEED_DATA);
  assert.equal(picked.length, 3);
  const ids = new Set(picked.map((p) => p.id));
  assert.equal(ids.size, 3);
});

test("generatePass builds a complete timed itinerary with food stop when enabled", () => {
  const pass = generatePass(SEED_DATA, {
    start: "Shyambazar",
    vibes: ["iconic", "insta"],
    hours: 6,
    mode: "auto_metro",
    food: true,
  });
  assert.equal(pass.startPoint.name, "Shyambazar");
  assert.equal(pass.pandalIds.length, 5);
  assert.equal(pass.foodStops, 1);
  assert.ok(pass.totalMins > 0);
  assert.ok(pass.items.some((item) => item.kind === "start"));
  assert.ok(pass.items.some((item) => item.kind === "food"));
});

test("generatePass omits food stop when food is false", () => {
  const pass = generatePass(SEED_DATA, {
    start: "Esplanade",
    vibes: ["quiet"],
    hours: 8,
    mode: "cab",
    food: false,
  });
  assert.equal(pass.pandalIds.length, 6);
  assert.equal(pass.foodStops, 0);
  assert.equal(pass.items.some((item) => item.kind === "food"), false);
});

test("map projection keeps all pandals and starts inside SVG bounds", () => {
  for (const pandal of SEED_DATA.pandals) {
    const x = mapX(pandal.x);
    const y = mapY(pandal.y);
    assert.ok(x > 0 && x < 760, `pandal ${pandal.name} x=${x} out of bounds`);
    assert.ok(y > 0 && y < 520, `pandal ${pandal.name} y=${y} out of bounds`);
  }
  for (const start of SEED_DATA.starts) {
    const x = mapX(start.x);
    const y = mapY(start.y);
    assert.ok(x > 0 && x < 760, `start ${start.name} x=${x} out of bounds`);
    assert.ok(y > 0 && y < 520, `start ${start.name} y=${y} out of bounds`);
  }
});

test("getProductData loads 56 pandals, 24 starts, and 30 foods from Cloud SQL", async () => {
  const data = await getProductData();
  assert.equal(data.pandals.length, 56);
  assert.equal(data.starts.length, 24);
  assert.equal(data.foods.length, 30);
  assert.equal(data.mapAreas.length, 22);
});
