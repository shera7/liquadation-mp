import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings, upsertSiteSettings } from "@/lib/settings";
import { logAdminAction } from "@/lib/auditLog";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const settings = await upsertSiteSettings(body);
  await logAdminAction({
    action: "settings.update",
    entityType: "Settings",
    description: "Изменены настройки сайта",
    metadata: { changedFields: body },
  });
  return NextResponse.json(settings);
}
