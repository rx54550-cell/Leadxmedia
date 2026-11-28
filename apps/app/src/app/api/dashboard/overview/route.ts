import { NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { publisherOverview } from "@/server/network";

export const dynamic = "force-dynamic";

/** GET /api/dashboard/overview — the signed-in publisher's wallet and traffic counters. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const overview = await publisherOverview(session.user.id);
  return NextResponse.json(
    { overview },
    { headers: { "Cache-Control": "no-store" } },
  );
}
