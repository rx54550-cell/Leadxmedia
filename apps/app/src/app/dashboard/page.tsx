import { Badge } from "@leadxmedia/ui";
import { ChartLine, Coins, MousePointerClick, Wallet } from "@leadxmedia/ui/icons";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OfferTable } from "@/components/dashboard/offer-table";
import { int, pct, usd } from "@/lib/network-format";
import { getSession } from "@/server/auth";
import { listOffers, publisherOverview, recentConversions } from "@/server/network";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Coins;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
      <div className="flex items-center gap-2 text-[12px] font-medium text-[#64748B]">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
          <Icon size={15} aria-hidden />
        </span>
        {label}
      </div>
      <p className="mt-3 text-[24px] leading-7 font-semibold tabular-nums tracking-[-0.02em] text-[#0F172A]">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-[#94A3B8]">{hint}</p>
    </div>
  );
}

const STATUS_STYLE: Record<string, string> = {
  APPROVED: "bg-[#DCFCE7] text-[#166534]",
  PENDING: "bg-[#FEF3C7] text-[#92400E]",
  REJECTED: "bg-[#FEE2E2] text-[#991B1B]",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Fdashboard");

  const [stats, offers, conversions] = await Promise.all([
    publisherOverview(session.user.id),
    listOffers({}, 6),
    recentConversions(session.user.id, 6),
  ]);

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[22px] leading-7 font-semibold tracking-[-0.02em] text-[#0F172A]">
            Welcome back, {session.user.name?.split(" ")[0] || "publisher"}
          </h1>
          <p className="mt-1 text-[13px] text-[#64748B]">
            Today: <span className="font-semibold text-[#0F172A]">{usd(stats.todayEarnings)}</span>
            <span className="mx-2 text-[#CBD5E1]">|</span>
            MTD: <span className="font-semibold text-[#0F172A]">{usd(stats.mtdEarnings)}</span>
          </p>
        </div>
        <Link
          href="/dashboard/statistics"
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-[12px] font-semibold text-[#334155] hover:bg-[#F8FAFC]"
        >
          <ChartLine size={14} aria-hidden /> Full statistics
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today earnings"
          value={usd(stats.todayEarnings)}
          hint="Approved conversions since 00:00 UTC"
          icon={Coins}
        />
        <StatCard
          label="Month to date"
          value={usd(stats.mtdEarnings)}
          hint="Approved conversions this calendar month"
          icon={ChartLine}
        />
        <StatCard
          label="Total clicks"
          value={int(stats.totalClicks)}
          hint={`${int(stats.todayClicks)} today · ${pct(stats.totalConversions, stats.totalClicks)} CVR`}
          icon={MousePointerClick}
        />
        <StatCard
          label="Available balance"
          value={usd(stats.balance)}
          hint={`${usd(stats.pendingEarnings)} pending · ${usd(stats.lifetimeCredited)} lifetime`}
          icon={Wallet}
        />
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-semibold text-[#0F172A]">Top live offers</h2>
            <p className="text-[12px] text-[#64748B]">
              Newest live inventory, ranked by creation date. Copy a link to start sending traffic.
            </p>
          </div>
          <Link href="/dashboard/offers" className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]">
            View all offers
          </Link>
        </div>
        <OfferTable offers={offers} empty="No live offers in the network yet. Seed the database to add inventory." />
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-semibold text-[#0F172A]">Recent conversions</h2>
            <p className="text-[12px] text-[#64748B]">Postbacks received for your clicks, newest first.</p>
          </div>
          <Link
            href="/dashboard/statistics"
            className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
          >
            See performance
          </Link>
        </div>

        {conversions.length ? (
          <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="bg-[#F8FAFC] text-[11px] font-semibold tracking-[0.06em] text-[#64748B] uppercase">
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Offer</th>
                  <th className="px-3 py-3">Country</th>
                  <th className="px-3 py-3 text-right">Payout</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] bg-white">
                {conversions.map((c) => (
                  <tr key={c.id}>
                    <td className="px-3 py-3 text-[12px] text-[#64748B]">
                      {c.createdAt.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        timeZone: "UTC",
                      })}
                    </td>
                    <td className="px-3 py-3 text-[12px] font-medium text-[#0F172A]">{c.offerName}</td>
                    <td className="px-3 py-3 text-[12px] text-[#334155]">{c.country ?? "—"}</td>
                    <td className="px-3 py-3 text-right text-[12px] font-semibold tabular-nums text-[#0F172A]">
                      {usd(c.payout)}
                    </td>
                    <td className="px-3 py-3">
                      <Badge className={STATUS_STYLE[c.status] ?? ""}>{c.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-8 text-center text-[13px] text-[#64748B]">
            No conversions yet. Copy an offer link above and send your first click.
          </div>
        )}
      </section>
    </div>
  );
}
