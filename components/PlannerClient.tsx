"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Icon from "@/components/Icon";
import Toast from "@/components/Toast";
import { generatePass, normalizePrefs } from "@/lib/itinerary";
import { loadPrefs, savePass, savePrefs } from "@/lib/storage";
import type { PandalPassData, Pass, Prefs } from "@/lib/types";

const TOTAL_STEPS = 4;

export default function PlannerClient({ data }: { data: PandalPassData }) {
  const router = useRouter();
  const { user, getFreshToken } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>(() => normalizePrefs(data, data.defaultPrefs));
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const saved = loadPrefs(data.site.storage.prefs);
    if (saved) setPrefs(normalizePrefs(data, saved));
  }, [data]);

  function showToast(message: string) {
    setToast(message);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2400);
  }

  function toggleVibe(id: string) {
    setPrefs((current) => {
      const selected = current.vibes.includes(id);
      return {
        ...current,
        vibes: selected ? current.vibes.filter((vibe) => vibe !== id) : [...current.vibes, id],
      };
    });
  }

  async function finish() {
    setBusy(true);
    try {
      let pass: Pass | null = null;
      if (user) {
        const token = await getFreshToken();
        if (token) {
          const authResponse = await fetch("/api/user/pass", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ prefs }),
          });
          if (authResponse.ok) {
            const payload = (await authResponse.json()) as { saved?: { pass: Pass } };
            pass = payload.saved?.pass ?? null;
          }
        }
      }

      if (!pass) {
        const response = await fetch("/api/pass", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prefs),
        });
        if (!response.ok) throw new Error("Could not generate pass");
        pass = (await response.json()) as Pass;
      }

      savePrefs(data.site.storage.prefs, prefs);
      savePass(data.site.storage.pass, pass);
      router.push("/pass");
    } catch {
      const pass = generatePass(data, prefs);
      savePrefs(data.site.storage.prefs, prefs);
      savePass(data.site.storage.pass, pass);
      showToast("Pass generated locally");
      router.push("/pass");
    } finally {
      setBusy(false);
    }
  }

  function next() {
    if (step < TOTAL_STEPS) {
      setStep((current) => current + 1);
      return;
    }
    void finish();
  }

  function back() {
    if (step > 1) {
      setStep((current) => current - 1);
      return;
    }
    router.push("/");
  }

  const selectedMode = data.modes.find((mode) => mode.id === prefs.mode);
  const selectedVibes = data.vibes.filter((vibe) => prefs.vibes.includes(vibe.id)).map((vibe) => vibe.label);
  const nextDisabled = step === 2 && prefs.vibes.length === 0;

  return (
    <>
      <div className="planner-layout">
        <section className="panel planner-panel" aria-label="PandalPass planner">
          <div className="progress" aria-hidden="true">
            {[1, 2, 3, 4].map((number) => (
              <span className={`progress__bar${number <= step ? " is-done" : ""}`} key={number} />
            ))}
          </div>
          <p className="step-label">Step {step} of {TOTAL_STEPS}</p>

          <div className="wizard">
            {step === 1 ? (
              <section>
                <h2 className="question">Where are you starting from?</h2>
                <p className="question-hint">Pick your launch point for the night.</p>
                <div className="options options--grid">
                  {data.starts.map((start) => {
                    const on = prefs.start === start.name;
                    return (
                      <button
                        type="button"
                        className={`option${on ? " is-selected" : ""}`}
                        aria-pressed={on}
                        key={start.name}
                        onClick={() => setPrefs((current) => ({ ...current, start: start.name }))}
                      >
                        <span className="option__main">
                          <Icon name="mapPin" size={18} />
                          <span>{start.name}</span>
                        </span>
                        <span className="option__check" aria-hidden="true">
                          <Icon name="check" size={14} strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {step === 2 ? (
              <section>
                <h2 className="question">What kind of PandalPass night?</h2>
                <p className="question-hint">Choose all that feel right.</p>
                <div className="options">
                  {data.vibes.map((vibe) => {
                    const on = prefs.vibes.includes(vibe.id);
                    return (
                      <button
                        type="button"
                        className={`option${on ? " is-selected" : ""}`}
                        aria-pressed={on}
                        key={vibe.id}
                        onClick={() => toggleVibe(vibe.id)}
                      >
                        <span className="option__main">
                          <Icon name={vibe.icon} size={18} />
                          <span>{vibe.label}</span>
                        </span>
                        <span className="option__check" aria-hidden="true">
                          <Icon name="check" size={14} strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {step === 3 ? (
              <section>
                <h2 className="question">How much time do you have?</h2>
                <p className="question-hint">We&apos;ll fit the route to your window.</p>
                <div className="options">
                  {data.times.map((time) => {
                    const on = prefs.hours === time.hours;
                    return (
                      <button
                        type="button"
                        className={`option${on ? " is-selected" : ""}`}
                        aria-pressed={on}
                        key={time.hours}
                        onClick={() => setPrefs((current) => ({ ...current, hours: time.hours }))}
                      >
                        <span className="option__main">
                          <Icon name="timer" size={18} />
                          <span>{time.hours} hours</span>
                        </span>
                        <span className="option__meta">~{time.count} pandals</span>
                        <span className="option__check" aria-hidden="true">
                          <Icon name="check" size={14} strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {step === 4 ? (
              <section>
                <h2 className="question">How do you want to travel?</h2>
                <p className="question-hint">Shapes your travel legs and timing.</p>
                <div className="options">
                  {data.modes.map((mode) => {
                    const on = prefs.mode === mode.id;
                    return (
                      <button
                        type="button"
                        className={`option${on ? " is-selected" : ""}`}
                        aria-pressed={on}
                        key={mode.id}
                        onClick={() => setPrefs((current) => ({ ...current, mode: mode.id }))}
                      >
                        <span className="option__main">
                          <Icon name={mode.icon} size={18} />
                          <span>{mode.label}</span>
                        </span>
                        <span className="option__check" aria-hidden="true">
                          <Icon name="check" size={14} strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="options">
                  <button
                    type="button"
                    className={`toggle-row${prefs.food ? " is-on" : ""}`}
                    role="switch"
                    aria-checked={prefs.food}
                    onClick={() => setPrefs((current) => ({ ...current, food: !current.food }))}
                  >
                    <span className="option__main">
                      <Icon name="utensils" size={18} />
                      <span>Add a food stop</span>
                    </span>
                    <span className="toggle" aria-hidden="true" />
                  </button>
                </div>
              </section>
            ) : null}
          </div>

          <div className="wizard__footer">
            <button className="btn btn--ghost" type="button" onClick={back} disabled={busy}>
              Back
            </button>
            <button
              className={`btn ${step === TOTAL_STEPS ? "btn--wine" : "btn--dark"}`}
              type="button"
              onClick={next}
              disabled={nextDisabled || busy}
            >
              {busy ? "Building route" : step === TOTAL_STEPS ? "Generate my PandalPass Pass" : "Next"}
            </button>
          </div>
        </section>

        <aside className="panel plan-summary" aria-label="Your plan so far">
          <p className="eyebrow">Your plan so far</p>
          <dl className="plan-summary__list">
            <div>
              <dt>Start</dt>
              <dd>{prefs.start}</dd>
            </div>
            <div>
              <dt>Vibes</dt>
              <dd>{selectedVibes.length ? selectedVibes.join(", ") : "None yet"}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{prefs.hours} hours</dd>
            </div>
            <div>
              <dt>Travel</dt>
              <dd>{selectedMode?.label ?? "Not set"}</dd>
            </div>
            <div>
              <dt>Food stop</dt>
              <dd>{prefs.food ? "Included" : "Skipped"}</dd>
            </div>
          </dl>
          <p className="plan-summary__note">
            Everything here is a planning estimate. Tap Generate when you&apos;re happy with the shape of the PandalPass night.
          </p>
        </aside>
      </div>
      <Toast message={toast} visible={toastVisible} />
    </>
  );
}
