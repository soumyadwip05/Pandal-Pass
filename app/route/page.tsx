import type { Metadata } from "next";
import RouteClient from "@/components/RouteClient";
import { getProductData } from "@/lib/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Route Map",
  description: "See your PandalPass route on a stylised Kolkata map with numbered stops, crowd estimates and metro lines.",
};

export default async function RoutePage() {
  const data = await getProductData();
  return (
    <div className="page">
      <RouteClient data={data} />
    </div>
  );
}
