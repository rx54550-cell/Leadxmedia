import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { int, pct, usd } from "@/lib/network-format";
import { getSession } from "@/server/auth";
import { dailyPerformance, type DailyPerformance } from "@/server/network";

export const metadata: Metadata = { title: "Statistics" };
export const dynamic = "force-dynamic";

const dayLabel = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  return ([1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((m) => m * p >= v) ?? 10) * p;
}

/** Grouped bars on one honest axis: clicks and conversions per day, drawn from the DB rows. */
function PerformanceChart({ rows }: { rows: DailyPerformance[] }) {
  const W = 720;
  const H = 260;
  const pad = { top: 16, right: 12, bottom: 34, left: 40 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const max = niceMax(Math.max(1, ...rows.map((r) => Math.max(r.clicks, r.conversions))));
  const group = plotW / Math.max(1, rows.length);
  const barW = Math.min(20, Math.max(6, group * 0.26));
  const y = (v: number) => pad.top + plotH - (v / max) * plotH;
  const ticks = [...new Set([0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f)))];

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-semibold text-[#0F172A]">Clicks vs conversions</h2>
          <p className="text-[11px] text-[#64748B]">Last 7 days, UTC. Both series share one y-axis.</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-medium text-[#475569]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#2563EB]" aria-hidden /> Clicks
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#10B981]" aria-hidden /> Conversions
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="260" role="img" aria-label="Clicks and conversions per day">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} stroke="#E2E8F0" strokeWidth="1" />
            <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#94A3B8">
              {t.toLocaleString("en-US")}
            </text>
          </g>
        ))}
        {rows.map((r, i) => {
          const cx = pad.left + group * i + group / 2;
          const clickH = (r.clicks / max) * plotH;
          const convH = (r.conversions / max) * plotH;
          return (
            <g key={r.date}>
              <rect
                x={cx - barW - 1}
                y={pad.top + plotH - clickH}
                width={barW}
                height={Math.max(0, clickH)}
                rx="2"
                fill="#2563EB"
              >
                <title>{`${dayLabel(r.date)}: ${r.clicks} clicks`}</title>
              </rect>
              <rect
                x={cx + 1}
                y={pad.top + plotH - convH}
                width={barW}
                height={Math.max(0, convH)}
                rx="2"
                fill="#10B981"
              >
                <title>{`${dayLabel(r.date)}: ${r.conversions} conversions`}</title>
              </rect>
              <text x={cx} y={H - 12} textAnchor="middle" fontSize="10" fill="#64748B">
                {dayLabel(r.date)}
              </text>
            </g>
          );
        })}
        <line
          x1={pad.left}
          x2={W - pad.right}
          y1={pad.top + plotH}
          y2={pad.top + plotH}
          stroke="#CBD5E1"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

export default async function StatisticsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Fdashboard%2Fstatistics");

  const rows = await dailyPerformance(session.user.id, 7);
  const totals = rows.reduce(
    (acc, r) => ({
      clicks: acc.clicks + r.clicks,
      conversions: acc.conversions + r.conversions,
      earnings: acc.earnings + r.earnings,
    }),
    { clicks: 0, conversions: 0, earnings: 0 },
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] leading-7 font-semibold tracking-[-0.02em] text-[#0F172A]">Statistics</h1>
        <p className="mt-1 text-[13px] text-[#64748B]">
          Clicks, conversions and approved earnings per day. Every row is grouped from the database.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Clicks (7d)", value: int(totals.clicks) },
          { label: "Conversions (7d)", value: int(totals.conversions) },
          { label: "Earnings (7d)", value: usd(totals.earnings) },
          { label: "Conversion rate", value: pct(totals.conversions, totals.clicks) },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[#E2E8F0] bg-white p-4">
            <p className="text-[12px] font-medium text-[#64748B]">{s.label}</p>
            <p className="mt-2 text-[22px] leading-6 font-semibold tabular-nums tracking-[-0.02em] text-[#0F172A]">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <PerformanceChart rows={rows} />

      <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="bg-[#F8FAFC] text-[11px] font-semibold tracking-[0.06em] text-[#64748B] uppercase">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Clicks</th>
              <th className="px-4 py-3 text-right">Conversions</th>
              <th className="px-4 py-3 text-right">Earnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] bg-white">
            {rows.map((r) => (
              <tr key={r.date} className="hover:bg-[#F8FAFC]">
                <td className="px-4 py-3 text-[12px] font-medium text-[#0F172A]">
                  {new Date(`${r.date}T00:00:00Z`).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                </td>
                <td className="px-4 py-3 text-right text-[12px] tabular-nums text-[#334155]">{int(r.clicks)}</td>
                <td className="px-4 py-3 text-right text-[12px] tabular-nums text-[#334155]">
                  {int(r.conversions)}
                </td>
                <td className="px-4 py-3 text-right text-[12px] font-semibold tabular-nums text-[#0F172A]">
                  {usd(r.earnings)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[#E2E8F0] bg-[#F8FAFC] text-[12px] font-semibold text-[#0F172A]">
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right tabular-nums">{int(totals.clicks)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{int(totals.conversions)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{usd(totals.earnings)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-[11px] text-[#94A3B8]">
        Earnings count APPROVED conversions only. Empty days are returned by the database as zero, not filled in
        by the page.
      </p>
    </div>
  );
}
