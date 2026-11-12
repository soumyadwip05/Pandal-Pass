import type { Metadata } from "next";
import ExploreClient from "@/components/ExploreClient";
import { getProductData } from "@/lib/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore Pandals",
  description: "Browse Kolkata's pandals by vibe, with crowd estimates and neighbourhood guides.",
};

export default async function ExplorePage() {
  const data = await getProductData();
  return (
    <div className="page">
      <div className="shell">
        <div className="page-head">
          <p className="eyebrow">Pandal directory</p>
          <h1>Explore pandals</h1>
          <p>Filter the city by the kind of night you want.</p>
        </div>
        <ExploreClient data={data} />
      </div>
    </div>
  );
}
