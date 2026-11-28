import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardSignOut } from "@/components/dashboard/sign-out";
import { usd } from "@/lib/network-format";
import { getSession } from "@/server/auth";
import { publisherOverview } from "@/server/network";

export const metadata: Metadata = {
  title: { default: "Publisher Dashboard", template: "%s · LeadXMedia" },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Fdashboard");

  const stats = await publisherOverview(session.user.id);
  const name = session.user.name || session.user.email;

  return (
    <div className="min-h-dvh bg-white text-[#0F172A] lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <DashboardSidebar />

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-white/95 backdrop-blur">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 lg:px-7">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">
                Publisher dashboard
              </p>
              <p className="truncate text-[14px] font-semibold text-[#0F172A]">{name}</p>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">Today</p>
                <p className="text-[15px] font-semibold tabular-nums text-[#0F172A]">
                  {usd(stats.todayEarnings)}
                </p>
              </div>
              <span className="h-8 w-px bg-[#E2E8F0]" aria-hidden />
              <div>
                <p className="text-[10px] font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">MTD</p>
                <p className="text-[15px] font-semibold tabular-nums text-[#0F172A]">
                  {usd(stats.mtdEarnings)}
                </p>
              </div>
              <span className="h-8 w-px bg-[#E2E8F0]" aria-hidden />
              <div>
                <p className="text-[10px] font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">Balance</p>
                <p className="text-[15px] font-semibold tabular-nums text-[#2563EB]">{usd(stats.balance)}</p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Link
                href="/dashboard/offers"
                className="hidden rounded-lg bg-[#2563EB] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#1D4ED8] sm:inline-flex"
              >
                Browse offers
              </Link>
              <DashboardSignOut />
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 bg-white px-4 py-6 lg:px-7 lg:py-8">{children}</main>

        <footer className="border-t border-[#E2E8F0] px-4 py-4 text-[11px] text-[#94A3B8] lg:px-7">
          LeadXMedia CPA Network · All figures are read from the live database.
        </footer>
      </div>
    </div>
  );
}
