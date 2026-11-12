import type { Metadata } from "next";
import PlannerClient from "@/components/PlannerClient";
import { getProductData } from "@/lib/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PandalPass Planner",
  description: "Build a personalised Durga Pujo route: choose your start, vibe, time window and travel style.",
};

export default async function PlannerPage() {
  const data = await getProductData();
  return (
    <div className="page">
      <div className="shell">
        <div className="page-head">
          <p className="eyebrow">Route builder</p>
          <h1>Design your night</h1>
          <p>
Four quick choices and PandalPass builds a timed route that fits how you actually want to spend the
evening.
          </p>
        </div>
        <PlannerClient data={data} />
      </div>
    </div>
  );
}
