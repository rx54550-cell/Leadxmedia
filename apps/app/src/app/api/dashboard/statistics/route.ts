import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { dailyPerformance } from "@/server/network";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard/statistics?days=7
 *
 * Clicks, conversions and approved earnings per UTC day, grouped from cpa_click / cpa_conversion.
 * The SQL returns a row for every day in the window, with zeros when there is no traffic.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requested = Number(req.nextUrl.searchParams.get("days") ?? 7);
  const days = Number.isFinite(requested) ? Math.min(90, Math.max(1, Math.trunc(requested))) : 7;

  const rows = await dailyPerformance(session.user.id, days);
  const totals = rows.reduce(
    (acc, row) => ({
      clicks: acc.clicks + row.clicks,
      conversions: acc.conversions + row.conversions,
      earnings: acc.earnings + row.earnings,
    }),
    { clicks: 0, conversions: 0, earnings: 0 },
  );

  return NextResponse.json(
    { days, rows, totals },
    { headers: { "Cache-Control": "no-store" } },
  );
}
