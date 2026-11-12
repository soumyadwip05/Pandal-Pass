import type { Metadata } from "next";
import PassClient from "@/components/PassClient";
import { getProductData } from "@/lib/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your PandalPass Pass",
  description: "Your generated PandalPass Pass: a timed pandal-hopping itinerary with travel legs, food stop and night summary.",
};

export default async function PassPage() {
  const data = await getProductData();
  return <PassClient data={data} />;
}
