import { user } from "@leadxmedia/db";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getSession } from "@/server/auth";
import { db } from "@/server/db";

export const metadata: Metadata = { title: "Advertiser Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdvertiserDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Fadvertiser%2Fdashboard");

  const [me] = await db()
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);
  if (me?.role !== "ADVERTISER") redirect("/dashboard");

  const name = session.user.name || session.user.email;

  return (
    <div className="min-h-dvh bg-white text-[#0F172A]">
      <header className="border-b border-[#E2E8F0]">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <Link href="/" className="text-[12px] font-semibold text-[#64748B] hover:text-[#0F172A]">
            Back to LeadXMedia
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-[#94A3B8] uppercase">
          Advertiser dashboard
        </p>
        <h1 className="mt-2 text-[28px] leading-9 font-semibold tracking-[-0.03em] text-[#0F172A]">
          Welcome, {name}
        </h1>
        <p className="mt-2 max-w-xl text-[14px] leading-6 text-[#64748B]">
          Your advertiser account is ready. Offer management, traffic quality controls and campaign
          reporting will appear here as the advertiser workspace is built out.
        </p>

        <div className="mt-8 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6">
          <h2 className="text-[15px] font-semibold text-[#0F172A]">What happens next</h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#64748B]">
            Your account is saved with the advertiser role. You can already browse the network from the
            public site while the advertiser tools are prepared.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-[#0A0A1B] px-4 text-[13px] font-semibold text-white hover:bg-[#171735]"
          >
            Explore LeadXMedia
          </Link>
        </div>
      </main>
    </div>
  );
}
