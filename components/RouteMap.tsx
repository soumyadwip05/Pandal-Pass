"use client";

import type { PandalPassData, Pass } from "@/lib/types";
import { mapX, mapY } from "@/lib/format";

export type RouteSelection = { kind: "start" } | { kind: "pandal"; id: number } | null;

interface RouteMapProps {
  data: PandalPassData;
  pass: Pass;
  selected: RouteSelection;
  located: boolean;
  onSelect: (selection: RouteSelection) => void;
}

export default function RouteMap({ data, pass, selected, located, onSelect }: RouteMapProps) {
  const start = pass.startPoint;
  const points = [start, ...pass.pandalIds.map((id) => data.pandals.find((pandal) => pandal.id === id))]
    .filter((point): point is NonNullable<typeof point> => Boolean(point))
    .map((point) => `${mapX(point.x)},${mapY(point.y)}`)
    .join(" ");

  const startSelected = selected?.kind === "start";

  return (
    <svg
      className="map"
      viewBox="0 0 760 520"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Stylised map of Kolkata with your pandal route"
    >
      <rect className="map__block" x="40" y="20" width="120" height="90" rx="6" />
      <rect className="map__block" x="500" y="20" width="110" height="70" rx="6" />
      <rect className="map__block" x="40" y="150" width="110" height="70" rx="6" />
      <rect className="map__block" x="40" y="380" width="150" height="100" rx="6" />
      <rect className="map__block" x="600" y="230" width="110" height="60" rx="6" />
      <rect className="map__park" x="140" y="235" width="150" height="110" rx="10" />
      <rect className="map__park" x="510" y="390" width="95" height="40" rx="10" />
      <ellipse className="map__water" cx="530" cy="445" rx="72" ry="28" />

      <path className="map__road" d="M80 0 V520" />
      <path className="map__road" d="M310 0 V520" />
      <path className="map__road" d="M540 0 V520" />
      <path className="map__road" d="M690 0 V520" />
      <path className="map__road" d="M0 130 H760" />
      <path className="map__road" d="M0 250 H760" />
      <path className="map__road" d="M0 360 H760" />
      <path className="map__road--minor map__road" d="M0 60 L760 90" />
      <path className="map__road--minor map__road" d="M0 300 H760" />
      <path className="map__road--minor map__road" d="M0 420 H760" />

      {data.mapAreas.map((area) => (
        <text className="map__area" x={mapX(area.x)} y={mapY(area.y)} key={area.label}>
          {area.label}
        </text>
      ))}

      <path className="map__metro map__metro--blue" d="M310 20 V510" />
      <path className="map__metro map__metro--green" d="M0 250 H760" />
      <circle className="map__station map__station--blue" cx="310" cy="130" r="6" />
      <circle className="map__station map__station--blue" cx="310" cy="350" r="6" />
      <circle className="map__station map__station--blue" cx="310" cy="470" r="6" />
      <circle className="map__station map__station--green" cx="120" cy="250" r="6" />
      <circle className="map__station map__station--green" cx="430" cy="250" r="6" />
      <circle className="map__station map__station--green" cx="660" cy="250" r="6" />

      <polyline className="map__route" points={points} />

      <g
        className={`marker is-route${startSelected ? " is-active" : ""}${located ? " is-located" : ""}`}
        tabIndex={0}
        role="button"
        aria-label={`Start at ${start.name}`}
        onClick={() => onSelect({ kind: "start" })}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect({ kind: "start" });
          }
        }}
      >
        <circle className="marker__bubble" cx={mapX(start.x)} cy={mapY(start.y) - 8} r={15} />
        <text className="marker__num" x={mapX(start.x)} y={mapY(start.y) - 8}>S</text>
        <text className="marker__label" x={mapX(start.x)} y={mapY(start.y) + 22} textAnchor="middle">Start</text>
      </g>

      {data.pandals.map((pandal) => {
        const order = pass.pandalIds.indexOf(pandal.id);
        const onRoute = order !== -1;
        const cx = mapX(pandal.x);
        const py = mapY(pandal.y);
        const cy = py - 8;
        const active = selected?.kind === "pandal" && selected.id === pandal.id;
        const temple = `M ${cx - 7} ${cy + 4} L ${cx - 7} ${cy} L ${cx} ${cy - 8} L ${cx + 7} ${cy} L ${cx + 7} ${cy + 4} Z`;
        return (
          <g
            className={`marker ${onRoute ? "is-route" : "is-dim"}${active ? " is-active" : ""}`}
            tabIndex={0}
            role="button"
            aria-label={`${pandal.name}, ${pandal.area}`}
            key={pandal.id}
            onClick={() => onSelect({ kind: "pandal", id: pandal.id })}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect({ kind: "pandal", id: pandal.id });
              }
            }}
          >
            <circle className="marker__bubble" cx={cx} cy={cy} r={onRoute ? 15 : 11} />
            {onRoute ? (
              <text className="marker__num" x={cx} y={cy}>{order + 1}</text>
            ) : (
              <path className="marker__glyph-shape" d={temple} />
            )}
            <circle className={`marker__dot--${pandal.crowd}`} cx={cx} cy={py + 7} r="4" />
            <text className="marker__label" x={cx} y={py + 22} textAnchor="middle">
              {pandal.name.split(" ")[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
