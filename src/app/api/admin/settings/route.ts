import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings, upsertSiteSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const settings = await upsertSiteSettings(body);
  return NextResponse.json(settings);
}
