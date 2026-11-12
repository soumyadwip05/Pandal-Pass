export function mapX(x: number): number {
  return Math.round(x * 0.92 + 150);
}

export function mapY(y: number): number {
  return Math.round(y * 0.84 + 24);
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function fmtClock(totalMinutes: number): string {
  const mins = ((totalMinutes % 1440) + 1440) % 1440;
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const h12 = h24 % 12 || 12;
  return `${h12}:${pad(m)} ${h24 >= 12 ? "PM" : "AM"}`;
}

export function fmtDur(mins: number): string {
  const rounded = Math.max(0, Math.round(mins));
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  if (!h) return `${m} min`;
  return `${h}h ${pad(m)}m`;
}

export function fmtKm(km: number): string {
  return `${Math.round(km * 10) / 10} km`;
}

export function fmtRupees(value: number): string {
  return `\u20b9${Math.round(value)}`;
}
