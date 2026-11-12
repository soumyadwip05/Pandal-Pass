import type { Metadata } from "next";
import Link from "next/link";
import FoodCard from "@/components/FoodCard";
import { getProductData } from "@/lib/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Food Stops",
  description: "Food stops for a Kolkata PandalPass night: bhog, phuchka, rolls, mishti and late-night cha.",
};

export default async function FoodPage() {
  const data = await getProductData();
  return (
    <div className="page">
      <div className="shell">
        <div className="page-head">
          <p className="eyebrow">Food stops</p>
          <h1>Refuel between pandals</h1>
          <p>
            Bhog, phuchka, kathi rolls, mishti and late-night cha, the edible side of a PandalPass crawl.
          </p>
        </div>
        <p className="note">Prices are rough per-person estimates.</p>
        <div className="card-grid card-grid--food">
          {data.foods.map((food) => (
            <FoodCard food={food} key={food.id} />
          ))}
        </div>
        <div className="page-cta">
          <Link className="btn btn--wine" href="/planner">Add food to my route</Link>
        </div>
      </div>
    </div>
  );
}
