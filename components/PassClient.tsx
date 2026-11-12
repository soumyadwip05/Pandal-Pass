"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Icon from "@/components/Icon";
import PandalCard from "@/components/PandalCard";
import Toast from "@/components/Toast";
import { fmtClock, fmtDur, fmtKm, fmtRupees } from "@/lib/format";
import { generatePass, normalizePrefs } from "@/lib/itinerary";
import { loadPass, loadPrefs, savePass, savePrefs } from "@/lib/storage";
import type { PandalPassData, Pass, Prefs } from "@/lib/types";

function Clock({ value }: { value: number }) {
  const [time, suffix] = fmtClock(value).split(" ");
  return (
    <>
      {time}
      <br />
      {suffix}
    </>
  );
}

function validPass(value: Pass | null): value is Pass {
  return Boolean(value && Array.isArray(value.items) && Array.isArray(value.pandalIds));
}

export default function PassClient({ data }: { data: PandalPassData }) {
  const { user, idToken } = useAuth();
  const [pass, setPass] = useState<Pass | null | undefined>(undefined);
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    let active = true;
    const stored = loadPass(data.site.storage.pass);
    if (validPass(stored)) {
      setPass(stored);
      return;
    }

    async function hydrate() {
      if (user && idToken) {
        try {
          const response = await fetch("/api/user/pass", {
            headers: { Authorization: `Bearer ${idToken}` },
            cache: "no-store",
          });
          if (response.ok) {
            const payload = (await response.json()) as {
              saved?: { prefs: Prefs; pass: Pass } | null;
            };
            if (payload.saved && validPass(payload.saved.pass)) {
              savePrefs(data.site.storage.prefs, payload.saved.prefs);
              savePass(data.site.storage.pass, payload.saved.pass);
              if (active) setPass(payload.saved.pass);
              return;
            }
          }
        } catch {
          // Fall back to local generation below
        }
      }

      const prefs = normalizePrefs(data, loadPrefs(data.site.storage.prefs));
      const generated = generatePass(data, prefs);
      savePass(data.site.storage.pass, generated);
      if (active) setPass(generated);
    }

    void hydrate();
    return () => {
      active = false;
    };
  }, [data, user, idToken]);

  function showToast(message: string) {
    setToast(message);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2400);
  }

  async function share() {
    if (!pass) return;
    const names = pass.pandalIds
      .map((id) => data.pandals.find((pandal) => pandal.id === id)?.name)
      .filter(Boolean)
      .join(" to ");
    const text = `My PandalPass Pass: ${pass.startPoint.name} to ${names} (${fmtDur(pass.totalMins)})`;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      showToast("Itinerary copied to clipboard");
    } catch {
      showToast("Couldn't copy. Take a screenshot instead");
    }
  }

  if (pass === undefined) {
    return (
      <div className="page">
        <div className="shell">
          <p className="panel" aria-busy="true">Loading your PandalPass Pass.</p>
        </div>
      </div>
    );
  }

  if (!pass) {
    return (
      <div className="page">
        <div className="shell empty-state">
          <p className="eyebrow">Your PandalPass Pass</p>
          <h1>No PandalPass pass yet.</h1>
          <p>Build a route first and your timed PandalPass pass will appear here.</p>
          <Link className="btn btn--wine" href="/planner">Open the planner</Link>
        </div>
      </div>
    );
  }

  const pandalCount = pass.pandalIds.length;
  const mode = data.modes.find((item) => item.id === pass.prefs.mode);
  const hasFood = pass.foodStops > 0;

  return (
    <>
      <section className="pass-band">
        <div className="shell">
          <div className="pass-band__top">
            <div>
              <p className="eyebrow">Your PandalPass Pass</p>
              <h1>One night. One PandalPass route.</h1>
              <p className="pass-band__line">
                {pass.prefs.hours} hours · {pandalCount} pandals · {pass.foodStops} food stop
                {pass.foodStops === 1 ? "" : "s"}
              </p>
            </div>
            <div className="pass-band__actions">
              <Link className="btn btn--gold" href="/route">View route</Link>
              <Link className="btn btn--ghost-light" href="/planner">Edit plan</Link>
              <button className="btn btn--ghost-light" type="button" onClick={share}>Share</button>
            </div>
          </div>

          <div className="metrics">
            <div className="metric">
              <div className="metric__value">{fmtDur(pass.totalMins)}</div>
              <div className="metric__label">Total time</div>
            </div>
            <div className="metric">
              <div className="metric__value">{fmtKm(pass.walkKm)}</div>
              <div className="metric__label">Walking</div>
            </div>
            <div className="metric">
              <div className="metric__value">{fmtRupees(pass.cost)}</div>
              <div className="metric__label">Per person</div>
            </div>
          </div>
          <p className="pass-band__note">{data.site.planningNote}</p>
        </div>
      </section>

      <div className="shell page-grid">
        <section className="panel" aria-label="Tonight's timeline">
          <h2 className="panel__title">Tonight&apos;s timeline</h2>
          <ol className="timeline">
            {pass.items.map((item, index) => {
              if (item.kind === "start") {
                return (
                  <li className="tl-row" key={`start-${index}`}>
                    <div className="tl-time"><Clock value={item.time} /></div>
                    <div className="tl-rail"><span className="tl-dot tl-dot--start" /></div>
                    <div className="tl-content">
                      <div className="tl-start">
                        <Icon name="mapPin" size={15} /> Start - {item.name}
                        <small>Meeting point</small>
                      </div>
                    </div>
                  </li>
                );
              }

              if (item.kind === "leg") {
                return (
                  <li className="tl-row" key={`leg-${index}`}>
                    <div className="tl-time" />
                    <div className="tl-rail" />
                    <div className="tl-content">
                      <span className="leg">
                        <Icon name={item.leg.icon} size={13} />
                        {item.leg.label ? `${item.leg.label} · ${item.leg.mins} min` : `${item.leg.type} · ${item.leg.mins} min`}
                      </span>
                    </div>
                  </li>
                );
              }

              if (item.kind === "pandal") {
                const pandal = data.pandals.find((entry) => entry.id === item.pandalId);
                if (!pandal) return null;
                return (
                  <li className="tl-row" key={`pandal-${index}`}>
                    <div className="tl-time">
                      <Clock value={item.time} />
                      <span className="tl-index">{String(item.index).padStart(2, "0")}</span>
                    </div>
                    <div className="tl-rail"><span className="tl-dot" /></div>
                    <div className="tl-content">
                      <PandalCard
                        pandal={pandal}
                        glyph={data.pandalGlyphs[pandal.id % data.pandalGlyphs.length]}
                        crowdLabel={data.crowdLabels[pandal.crowd]}
                        tagLabels={data.tagLabels}
                        variant="row"
                        meta={`Wait: ${item.wait}m · Stay: ${item.stay}m`}
                      />
                    </div>
                  </li>
                );
              }

              const food = data.foods.find((entry) => entry.id === item.foodId);
              if (!food) return null;
              return (
                <li className="tl-row" key={`food-${index}`}>
                  <div className="tl-time"><Clock value={item.time} /></div>
                  <div className="tl-rail"><span className="tl-dot tl-dot--food" /></div>
                  <div className="tl-content">
                    <Link className="food-card" href="/food">
                      <div className="food-card__top">
                        <span className="food-card__name">
                          <Icon name={food.icon} size={14} /> {food.name}
                        </span>
                        <span className="badge badge--food">Food stop</span>
                      </div>
                      <div className="food-card__meta">
                        {food.kind} · {fmtRupees(food.price)}/person
                      </div>
                      <span className="food-card__link">
                        View food options <Icon name="arrowRight" size={12} />
                      </span>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <aside className="pass-aside">
          <section className="panel summary" aria-label="Night summary">
            <p className="eyebrow">Night summary</p>
            <h2>PandalPass night complete.</h2>
            <div className="summary__grid">
              <div className="summary__cell">
                <div className="summary__num">{pandalCount}</div>
                <div className="summary__lbl">Pandals</div>
              </div>
              <div className="summary__cell">
                <div className="summary__num">{pass.foodStops}</div>
                <div className="summary__lbl">Food stops</div>
              </div>
              <div className="summary__cell">
                <div className="summary__num">{fmtKm(pass.walkKm)}</div>
                <div className="summary__lbl">Walked</div>
              </div>
              <div className="summary__cell">
                <div className="summary__num">{fmtDur(pass.travelMins)}</div>
                <div className="summary__lbl">On the move</div>
              </div>
            </div>
            <div className="pills">
              <span className="pill">
                <Icon name="users" size={12} /> Crowd: {pass.crowd}
              </span>
              <span className="pill">{mode?.label ?? "Travel plan"}</span>
              {hasFood ? <span className="pill">Food included</span> : null}
            </div>
            <p className="summary__outro">Until next PandalPass.</p>
          </section>

          <section className="panel">
            <h3 className="panel__title">Route at a glance</h3>
            <p className="note">
              Open the map to see every stop in order, check crowd estimates and pick a different pandal.
            </p>
            <Link className="btn btn--wine" href="/route">Open route map</Link>
          </section>
        </aside>
      </div>
      <Toast message={toast} visible={toastVisible} />
    </>
  );
}
