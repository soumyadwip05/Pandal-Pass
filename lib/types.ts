export type Crowd = "low" | "moderate" | "heavy";

export interface SiteConfig {
  name: string;
  festival: string;
  planningNote: string;
  storage: {
    prefs: string;
    pass: string;
  };
}

export interface Pandal {
  id: number;
  name: string;
  area: string;
  tagline: string;
  tags: string[];
  crowd: Crowd;
  x: number;
  y: number;
}

export interface StartPoint {
  name: string;
  x: number;
  y: number;
}

export interface Food {
  id: string;
  icon: string;
  name: string;
  kind: string;
  area: string;
  price: number;
}

export interface Vibe {
  id: string;
  icon: string;
  label: string;
}

export interface TimeOption {
  hours: number;
  count: number;
}

export interface TravelMode {
  id: string;
  icon: string;
  label: string;
}

export interface TravelRule {
  label: string;
  icon: string;
  baseMins?: number;
  minsPerKm?: number;
  baseCost?: number;
  costPerKm?: number;
  maxKm?: number;
  cost?: number;
  walkKm?: number;
}

export interface EngineConfig {
  distanceScale: number;
  startClock: number;
  stayBase: number;
  stayStep: number;
  waitStep: number;
  minLegMins: number;
  foodOffset: number;
  foodWalkMins: number;
  foodWalkKm: number;
  foodStayMins: number;
  crowdBase: Record<Crowd, number>;
  travel: Record<string, TravelRule>;
}

export interface MapArea {
  label: string;
  x: number;
  y: number;
}

export interface PandalPassData {
  site: SiteConfig;
  defaultPrefs: Prefs;
  home: {
    pickIds: number[];
    foodCount: number;
  };
  pandalGlyphs: string[];
  crowdLabels: Record<Crowd, string>;
  tagLabels: Record<string, string>;
  pandals: Pandal[];
  starts: StartPoint[];
  foods: Food[];
  vibes: Vibe[];
  times: TimeOption[];
  modes: TravelMode[];
  engine: EngineConfig;
  mapAreas: MapArea[];
}

export interface Prefs {
  start: string;
  vibes: string[];
  hours: number;
  mode: string;
  food: boolean;
}

export interface Leg {
  type: string;
  icon: string;
  mins: number;
  walkKm: number;
  cost: number;
  km: number;
  label?: string;
}

export type PassItem =
  | { kind: "start"; time: number; name: string }
  | { kind: "leg"; leg: Leg }
  | {
      kind: "pandal";
      time: number;
      index: number;
      pandalId: number;
      wait: number;
      stay: number;
    }
  | { kind: "food"; time: number; foodId: string };

export interface Pass {
  prefs: Prefs;
  startPoint: StartPoint;
  pandalIds: number[];
  items: PassItem[];
  totalMins: number;
  walkKm: number;
  cost: number;
  crowd: string;
  foodStops: number;
  travelMins: number;
}
