import { NextResponse } from "next/server";
import { getProductData } from "@/lib/repository";
import { guardApiRequest } from "../../../src/lib/security.ts";

export async function GET(request: Request) {
  const blocked = guardApiRequest(request, {
    routeKey: "api:data",
    limit: 60,
    windowMs: 60_000,
    enforceOrigin: false,
  });
  if (blocked) return blocked;

  return NextResponse.json(await getProductData());
}
