"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/Icon";
import PandalCard from "@/components/PandalCard";
import type { PandalPassData } from "@/lib/types";

export default function ExploreClient({ data }: { data: PandalPassData }) {
  const [current, setCurrent] = useState("all");
  const filters = [
    { id: "all", label: "All pandals", icon: null },
    ...data.vibes.map((vibe) => ({ id: vibe.id, label: vibe.label, icon: vibe.icon })),
  ];
  const items = data.pandals.filter((pandal) => current === "all" || pandal.tags.includes(current));

  return (
    <>
      <div className="filters" role="tablist" aria-label="Filter pandals by vibe">
        {filters.map((filter) => (
          <button
            className={`filter${filter.id === current ? " is-selected" : ""}`}
            type="button"
            role="tab"
            aria-selected={filter.id === current}
            key={filter.id}
            onClick={() => setCurrent(filter.id)}
          >
            {filter.icon ? <Icon name={filter.icon} size={14} /> : null}
            {filter.label}
          </button>
        ))}
      </div>
      <p className="note">{data.site.planningNote}</p>
      <p className="explore-count" aria-live="polite">
        {items.length} pandal{items.length === 1 ? "" : "s"} across Kolkata
      </p>
      <div className="card-grid">
        {items.length ? (
          items.map((pandal) => (
            <PandalCard
              key={pandal.id}
              pandal={pandal}
              glyph={data.pandalGlyphs[pandal.id % data.pandalGlyphs.length]}
              crowdLabel={data.crowdLabels[pandal.crowd]}
              tagLabels={data.tagLabels}
            />
          ))
        ) : (
          <p className="list-empty">No pandals match this filter.</p>
        )}
      </div>
      <div className="page-cta">
        <Link className="btn btn--wine" href="/planner">Plan my PandalPass</Link>
      </div>
    </>
  );
}
