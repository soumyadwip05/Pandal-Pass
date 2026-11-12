import type {
  Crowd,
  Leg,
  Pandal,
  PandalPassData,
  Pass,
  PassItem,
  Prefs,
  StartPoint,
} from "./types";

export function getStart(data: PandalPassData, name: string): StartPoint {
  return data.starts.find((start) => start.name === name) ?? data.starts[0];
}

export function timeCount(data: PandalPassData, hours: number): number {
  return data.times.find((time) => time.hours === hours)?.count ?? 4;
}

export function distanceKm(from: StartPoint | Pandal, to: Pandal, scale: number): number {
  return Math.hypot(to.x - from.x, to.y - from.y) * scale;
}

export function normalizePrefs(data: PandalPassData, value: unknown): Prefs {
  const base = data.defaultPrefs;
  if (!value || typeof value !== "object") return { ...base, vibes: [...base.vibes] };

  const raw = value as Partial<Prefs>;
  const vibes = Array.isArray(raw.vibes)
    ? raw.vibes.filter((vibe): vibe is string => typeof vibe === "string" && data.vibes.some((v) => v.id === vibe))
    : [...base.vibes];

  const hours = typeof raw.hours === "number" && data.times.some((time) => time.hours === raw.hours)
    ? raw.hours
    : base.hours;

  return {
    start: typeof raw.start === "string" && data.starts.some((start) => start.name === raw.start)
      ? raw.start
      : base.start,
    vibes: vibes.length ? vibes : [...base.vibes],
    hours,
    mode: typeof raw.mode === "string" && data.modes.some((mode) => mode.id === raw.mode)
      ? raw.mode
      : base.mode,
    food: typeof raw.food === "boolean" ? raw.food : base.food,
  };
}

export function crowded(pandal: Pandal): boolean {
  return pandal.crowd === "heavy";
}

export function crowdScore(pandal: Pandal): number {
  return pandal.crowd === "low" ? 0 : pandal.crowd === "moderate" ? 1 : 2;
}

export function vibeScore(pandal: Pandal, vibes: string[]): number {
  return pandal.tags.reduce((score, tag) => score + (vibes.includes(tag) ? 1 : 0), 0);
}

export function scorePandal(pandal: Pandal, prefs: Prefs, start: StartPoint, data: PandalPassData): number {
  const vibe = vibeScore(pandal, prefs.vibes);
  const crowd = crowdScore(pandal);
  const dist = distanceKm(start, pandal, data.engine.distanceScale);
  const penalty = prefs.vibes.includes("quiet") ? crowd * 2 : crowd * 0.5;
  return vibe * 10 - penalty - dist * data.engine.distanceScale;
}

export function pickPandals(prefs: Prefs, start: StartPoint, data: PandalPassData): Pandal[] {
  const count = timeCount(data, prefs.hours);
  const scored = data.pandals
    .slice()
    .sort((a, b) => scorePandal(b, prefs, start, data) - scorePandal(a, prefs, start, data));

  const picked = scored.slice(0, 1);
  while (picked.length < count && picked.length < data.pandals.length) {
    let best: Pandal | null = null;
    let bestScore = -Infinity;
    for (const pandal of scored) {
      if (picked.some((item) => item.id === pandal.id)) continue;
      const nearest = Math.min(...picked.map((item) => distanceKm(item, pandal, data.engine.distanceScale)));
      const score = vibeScore(pandal, prefs.vibes) * 10 - nearest * data.engine.distanceScale - crowdScore(pandal);
      if (score > bestScore) {
        best = pandal;
        bestScore = score;
      }
    }
    if (!best) break;
    picked.push(best);
  }

  return pickupOrder(picked, start, data.engine.distanceScale).slice(0, count);
}

function pickupOrder(picked: Pandal[], start: StartPoint, scale: number): Pandal[] {
  const remaining = picked.slice();
  const ordered: Pandal[] = [];
  let current: StartPoint | Pandal = start;
  while (remaining.length) {
    let best = 0;
    for (let index = 1; index < remaining.length; index += 1) {
      if (distanceKm(current, remaining[index], scale) < distanceKm(current, remaining[best], scale)) {
        best = index;
      }
    }
    const next = remaining.splice(best, 1)[0];
    ordered.push(next);
    current = next;
  }
  return ordered;
}

export function legFor(data: PandalPassData, from: StartPoint | Pandal, to: Pandal, mode: string): Leg {
  const km = distanceKm(from, to, data.engine.distanceScale);
  const travel = data.engine.travel;
  const walk = travel.walk;
  const auto = travel.auto;
  const cab = travel.cab;
  const metro = travel.metro;

  let rule = metro;
  if (mode === "cab") {
    rule = cab;
  } else if (mode === "walk" && km <= (walk.maxKm ?? 0)) {
    rule = walk;
  } else if (mode === "auto_metro" && km <= (auto.maxKm ?? 0)) {
    rule = auto;
  }

  const mins = (rule.baseMins ?? 0) + km * (rule.minsPerKm ?? 0);
  const cost = (rule.baseCost ?? 0) + km * (rule.costPerKm ?? 0) + (rule.cost ?? 0);
  const walkKm = rule === walk ? km : (rule.walkKm ?? 0);

  return {
    type: rule.label,
    icon: rule.icon,
    mins: Math.max(data.engine.minLegMins, Math.round(mins)),
    walkKm,
    cost,
    km,
    label: rule === metro && rule.walkKm ? `${Math.round(rule.walkKm * 1000)}m walk` : undefined,
  };
}

export function generatePass(data: PandalPassData, prefsInput: Prefs): Pass {
  const prefs = normalizePrefs(data, prefsInput);
  const start = getStart(data, prefs.start);
  const ordered = pickPandals(prefs, start, data);
  const engine = data.engine;
  const items: PassItem[] = [];
  let clock = engine.startClock;
  let walkKm = 0;
  let cost = 0;
  let travelMins = 0;
  let foodStops = 0;
  let previous: StartPoint | Pandal = start;

  items.push({ kind: "start", time: clock, name: prefs.start });

  ordered.forEach((pandal, index) => {
    const leg = legFor(data, previous, pandal, prefs.mode);
    clock += leg.mins;
    walkKm += leg.walkKm;
    cost += leg.cost;
    travelMins += leg.mins;
    items.push({ kind: "leg", leg });

    const wait = crowded(pandal) ? engine.waitStep * 2 : engine.waitStep;
    const stay = engine.stayBase + crowdScore(pandal) * engine.stayStep;
    clock += wait + stay;
    items.push({ kind: "pandal", time: clock, index, pandalId: pandal.id, wait, stay });

    const foodIndex = Math.min(1, ordered.length - 2);
    if (prefs.food && index === foodIndex && data.foods.length) {
      const food = data.foods[(pandal.id + engine.foodOffset) % data.foods.length];
      const foodLeg: Leg = {
        type: "Walk",
        icon: "walk",
        mins: engine.foodWalkMins,
        walkKm: engine.foodWalkKm,
        cost: 0,
        km: engine.foodWalkKm,
        label: `${Math.round(engine.foodWalkKm * 1000)}m`,
      };
      clock += foodLeg.mins + engine.foodStayMins;
      walkKm += foodLeg.walkKm;
      travelMins += foodLeg.mins;
      foodStops += 1;
      items.push({ kind: "leg", leg: foodLeg });
      items.push({ kind: "food", time: clock, foodId: food.id });
    }

    previous = pandal;
  });

  const heavy = ordered.filter(crowded).length;
  const crowd: Crowd = heavy >= 2 ? "heavy" : heavy === 1 ? "moderate" : "low";

  return {
    prefs,
    startPoint: start,
    pandalIds: ordered.map((pandal) => pandal.id),
    items,
    totalMins: clock - engine.startClock,
    walkKm,
    cost: Math.round(cost / 10) * 10,
    crowd: data.crowdLabels[crowd],
    foodStops,
    travelMins,
  };
}
