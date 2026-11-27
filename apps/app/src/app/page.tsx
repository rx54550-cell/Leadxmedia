import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock,
  Coins,
  Globe,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
  TrendUp,
  Users,
  Wallet,
} from "@leadxmedia/ui/icons";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MarketingFooter, MarketingNav } from "@/components/marketing/chrome";
import { currentUser } from "@/server/context";

export const metadata: Metadata = {
  title: "Earn More From Every Click",
  description:
    "Join 12,000+ publishers earning daily from 4,800+ premium CPA offers. No experience needed. Get paid in 24 hours.",
};

const primaryBtn =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 text-[15px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(37,99,235,0.65)] hover:bg-[#1D4ED8]";
const secondaryBtn =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-6 text-[15px] font-semibold text-[#0F172A] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]";

const STATS = [
  { value: "12,000+", label: "Active publishers" },
  { value: "4,800+", label: "Premium CPA offers" },
  { value: "$4.2M", label: "Paid out every month" },
  { value: "24 hrs", label: "Average payout speed" },
];

const OFFERS = [
  {
    mark: "BC",
    category: "Finance",
    name: "Premium Business Card",
    description: "Verified applications from small-business owners. US & CA traffic.",
    payout: "$64.00",
    epc: "$2.18",
  },
  {
    mark: "HI",
    category: "Insurance",
    name: "Home Insurance Quote",
    description: "High-intent homeowners comparing cover. Email and native traffic.",
    payout: "$48.00",
    epc: "$1.74",
  },
  {
    mark: "SP",
    category: "Energy",
    name: "Solar Savings Plan",
    description: "Qualified solar appointments in 14 states. Warm-transfer friendly.",
    payout: "$92.00",
    epc: "$3.06",
  },
];

const STEPS = [
  {
    icon: Users,
    title: "Create your free account",
    body: "Two minutes, no credit card and no experience needed. Tell us how you drive traffic and you’re in.",
  },
  {
    icon: MousePointerClick,
    title: "Grab your affiliate link",
    body: "Pick from 4,800+ direct offers, generate a tracked link in one click and start sending traffic today.",
  },
  {
    icon: Wallet,
    title: "Get paid in 24 hours",
    body: "Choose daily, weekly or on-demand payouts. Withdraw to bank, PayPal, Wise or crypto with no hidden fees.",
  },
];

const PUBLISHER_POINTS = [
  "4,800+ direct offers across 12 verticals",
  "Instant approval on most offers",
  "Daily, weekly or on-demand payouts",
  "Real-time clicks, conversions and EPC",
];

const ADVERTISER_POINTS = [
  "Fraud-screened, verified publisher network",
  "CPA, CPL and revshare models",
  "Real-time conversion postbacks",
  "Dedicated affiliate manager",
];

export default async function Home() {
  // Signed-in users keep the existing behaviour: straight to the dashboard.
  if (await currentUser()) redirect("/app");

  return (
    <div className="marketing min-h-dvh bg-white text-[#0F172A]">
      <MarketingNav />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white">
          <div className="mx-auto grid max-w-[1200px] items-center gap-16 px-5 pt-16 pb-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pt-24 lg:pb-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-1.5 text-[12px] font-semibold text-[#1D4ED8]">
                <Sparkles size={13} />
                Premium CPA network · 4,800+ live offers
              </span>

              <h1 className="mt-6 text-[44px] leading-[1.04] font-semibold tracking-[-0.045em] text-[#0F172A] sm:text-[58px] lg:text-[64px]">
                Earn More From
                <br />
                <span className="underline decoration-[#2563EB] decoration-[6px] underline-offset-[10px]">
                  Every Click
                </span>
                .
              </h1>

              <p className="mt-7 max-w-[54ch] text-[16px] leading-7 text-[#64748B] sm:text-[17px]">
                Join 12,000+ publishers earning daily from 4,800+ premium CPA offers. No experience needed. Get
                paid in 24 hours.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup" className={primaryBtn}>
                  Start Earning — It’s Free
                  <ArrowRight size={16} />
                </Link>
                <Link href="/network" className={secondaryBtn}>
                  Browse Offers
                </Link>
              </div>

              <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-medium text-[#64748B]">
                {["Free to join", "No experience needed", "Paid in 24 hours"].map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <Check size={14} className="text-[#2563EB]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <HeroVisual />
          </div>
        </section>

        {/* ── Proof strip ──────────────────────────────────────────────── */}
        <section className="border-y border-[#F1F5F9] bg-white">
          <dl className="mx-auto grid max-w-[1200px] grid-cols-2 gap-x-6 gap-y-8 px-5 py-10 sm:px-8 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dd className="text-[30px] leading-9 font-semibold tracking-[-0.035em] text-[#0F172A] sm:text-[34px]">
                  {stat.value}
                </dd>
                <dt className="mt-1 text-[13px] text-[#64748B]">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Offers ───────────────────────────────────────────────────── */}
        <section id="offers" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 py-20 sm:px-8 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[12px] font-semibold tracking-[0.14em] text-[#2563EB] uppercase">
                Top paying this week
              </p>
              <h2 className="mt-3 max-w-[22ch] text-[32px] leading-[1.1] font-semibold tracking-[-0.04em] text-[#0F172A] sm:text-[40px]">
                Offers that actually convert
              </h2>
              <p className="mt-3 max-w-[56ch] text-[15px] leading-6 text-[#64748B]">
                Hand-picked direct offers from premium advertisers — higher payouts, cleaner traffic and faster
                approvals than any public network.
              </p>
            </div>
            <Link
              href="/network"
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
            >
              Browse all offers
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {OFFERS.map((offer) => (
              <article
                key={offer.name}
                className="group flex flex-col rounded-2xl border border-[#E2E8F0] bg-white p-6 hover:border-[#BFDBFE] hover:shadow-[0_24px_48px_-28px_rgba(37,99,235,0.4)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[14px] font-bold text-[#2563EB]">
                    {offer.mark}
                  </span>
                  <span className="rounded-full border border-[#E2E8F0] px-2.5 py-1 text-[11px] font-semibold text-[#64748B]">
                    {offer.category}
                  </span>
                </div>
                <h3 className="mt-4 text-[16px] font-semibold tracking-[-0.01em] text-[#0F172A]">{offer.name}</h3>
                <p className="mt-1.5 flex-1 text-[13px] leading-5 text-[#64748B]">{offer.description}</p>
                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-[#F1F5F9] pt-4">
                  <div>
                    <dt className="text-[11px] font-medium tracking-wide text-[#94A3B8] uppercase">Payout</dt>
                    <dd className="mt-0.5 text-[20px] font-semibold tracking-[-0.02em] text-[#0F172A]">
                      {offer.payout}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-medium tracking-wide text-[#94A3B8] uppercase">EPC</dt>
                    <dd className="mt-0.5 text-[20px] font-semibold tracking-[-0.02em] text-[#0F172A]">
                      {offer.epc}
                    </dd>
                  </div>
                </dl>
                <Link
                  href="/network"
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[13px] font-semibold text-[#0F172A] group-hover:border-[#2563EB] group-hover:text-[#2563EB]"
                >
                  Get affiliate link
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section className="border-y border-[#F1F5F9] bg-[#F8FAFC]">
          <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-24">
            <div className="max-w-[52ch]">
              <p className="text-[12px] font-semibold tracking-[0.14em] text-[#2563EB] uppercase">How it works</p>
              <h2 className="mt-3 text-[32px] leading-[1.1] font-semibold tracking-[-0.04em] text-[#0F172A] sm:text-[40px]">
                From sign-up to payout in three steps
              </h2>
            </div>
            <ol className="mt-10 grid gap-5 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                      <step.icon size={19} />
                    </span>
                    <span className="text-[13px] font-semibold text-[#CBD5E1]">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 text-[16px] font-semibold text-[#0F172A]">{step.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-6 text-[#64748B]">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Two audiences ────────────────────────────────────────────── */}
        <section className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-24">
          <div className="grid gap-6 lg:grid-cols-2">
            <article
              id="publishers"
              className="scroll-mt-24 rounded-3xl border border-[#E2E8F0] bg-white p-8 sm:p-10"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                <Globe size={20} />
              </span>
              <p className="mt-6 text-[12px] font-semibold tracking-[0.14em] text-[#2563EB] uppercase">
                For publishers
              </p>
              <h2 className="mt-2 text-[28px] leading-[1.15] font-semibold tracking-[-0.035em] text-[#0F172A] sm:text-[32px]">
                Turn your traffic into daily income
              </h2>
              <p className="mt-3 text-[14.5px] leading-6 text-[#64748B]">
                Whether you run a newsletter, a review site or paid social, there’s a high-converting offer waiting
                for your audience.
              </p>
              <ul className="mt-6 space-y-3">
                {PUBLISHER_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-[14px] text-[#334155]">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB]">
                      <Check size={12} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={`${primaryBtn} mt-8 w-full sm:w-auto`}>
                Start earning free
                <ArrowRight size={16} />
              </Link>
            </article>

            <article
              id="advertisers"
              className="scroll-mt-24 rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-8 sm:p-10"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-white text-[#2563EB] shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                <ShieldCheck size={20} />
              </span>
              <p className="mt-6 text-[12px] font-semibold tracking-[0.14em] text-[#2563EB] uppercase">
                For advertisers
              </p>
              <h2 className="mt-2 text-[28px] leading-[1.15] font-semibold tracking-[-0.035em] text-[#0F172A] sm:text-[32px]">
                Performance you can measure, at scale
              </h2>
              <p className="mt-3 text-[14.5px] leading-6 text-[#64748B]">
                Launch a CPA campaign in minutes and only pay for results. Every publisher is vetted, every
                conversion is tracked.
              </p>
              <ul className="mt-6 space-y-3">
                {ADVERTISER_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-[14px] text-[#334155]">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-[#2563EB]">
                      <Check size={12} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={`${secondaryBtn} mt-8 w-full bg-white sm:w-auto`}>
                Launch a campaign
                <ArrowRight size={16} />
              </Link>
            </article>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-[1200px] px-5 pb-20 sm:px-8 lg:pb-24">
          <div className="relative overflow-hidden rounded-3xl bg-[#2563EB] px-6 py-14 text-center sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/10"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-white/5"
            />
            <h2 className="relative mx-auto max-w-[22ch] text-[32px] leading-[1.1] font-semibold tracking-[-0.04em] text-white sm:text-[44px]">
              Your next payout starts with one click.
            </h2>
            <p className="relative mx-auto mt-4 max-w-[52ch] text-[15px] leading-6 text-[#DBEAFE]">
              Join 12,000+ publishers already earning with LeadXMedia. Free to join, paid in 24 hours.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-[#1D4ED8] hover:bg-[#EFF6FF]"
              >
                Start Earning — It’s Free
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/network"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/30 px-6 text-[15px] font-semibold text-white hover:bg-white/10"
              >
                Browse Offers
              </Link>
            </div>
            <p className="relative mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12.5px] text-[#BFDBFE]">
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} />
                24-hour payouts
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Coins size={13} />
                No hidden fees
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck size={13} />
                Verified offers only
              </span>
            </p>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

/** Decorative publisher-dashboard mockup used beside the hero copy. */
function HeroVisual() {
  const bars = [38, 52, 44, 66, 58, 82, 100];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const rows = [
    { mark: "BC", name: "Business Card", geo: "US · Finance", payout: "$64.00" },
    { mark: "HI", name: "Home Insurance", geo: "US · Insurance", payout: "$48.00" },
    { mark: "SP", name: "Solar Savings", geo: "CA · Energy", payout: "$92.00" },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none" aria-hidden>
      <div className="absolute -inset-8 -z-10 rounded-[40px] bg-[radial-gradient(60%_60%_at_55%_40%,#DBEAFE_0%,rgba(255,255,255,0)_72%)]" />

      <div className="relative rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_36px_80px_-36px_rgba(15,23,42,0.32)] sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-[12.5px] font-semibold text-[#64748B]">Publisher dashboard</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[10.5px] font-semibold text-[#16A34A]">
            <span className="size-1.5 rounded-full bg-[#22C55E]" />
            Live
          </span>
        </div>

        <div className="mt-4">
          <p className="text-[12px] text-[#94A3B8]">Today’s earnings</p>
          <div className="mt-1 flex items-end gap-2.5">
            <p className="text-[34px] leading-10 font-semibold tracking-[-0.04em] text-[#0F172A]">$1,284.50</p>
            <span className="mb-1 inline-flex items-center gap-0.5 rounded-md bg-[#F0FDF4] px-1.5 py-0.5 text-[10.5px] font-semibold text-[#16A34A]">
              <TrendUp size={11} />
              18.2%
            </span>
          </div>
        </div>

        <div className="mt-5 flex h-24 items-end gap-2">
          {bars.map((height, index) => (
            <div key={index} className="flex h-full flex-1 flex-col justify-end">
              <div
                className="w-full rounded-t-[4px]"
                style={{
                  height: `${height}%`,
                  background:
                    index === bars.length - 1 ? "linear-gradient(180deg,#3B82F6,#2563EB)" : "#DBEAFE",
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          {days.map((day, index) => (
            <span key={index} className="flex-1 text-center text-[10px] font-medium text-[#94A3B8]">
              {day}
            </span>
          ))}
        </div>

        <div className="mt-5 border-t border-[#F1F5F9] pt-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-wide text-[#94A3B8] uppercase">Top offers</p>
            <p className="text-[11px] font-medium text-[#2563EB]">This week</p>
          </div>
          <ul className="mt-2.5 space-y-2">
            {rows.map((row) => (
              <li key={row.name} className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[10px] font-bold text-[#2563EB]">
                  {row.mark}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold text-[#0F172A]">{row.name}</span>
                  <span className="block truncate text-[10.5px] text-[#94A3B8]">{row.geo}</span>
                </span>
                <span className="text-[12.5px] font-semibold text-[#0F172A]">{row.payout}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F8FAFC] px-3.5 py-2.5">
          <span className="text-[11px] font-medium text-[#64748B]">Next payout · Tomorrow</span>
          <span className="rounded-lg bg-[#2563EB] px-3 py-1.5 text-[10.5px] font-semibold text-white">
            Withdraw
          </span>
        </div>
      </div>

      <div className="absolute -top-5 -right-2 z-10 hidden w-[172px] rounded-xl border border-[#E2E8F0] bg-white p-3.5 shadow-[0_20px_44px_-22px_rgba(15,23,42,0.32)] sm:block">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-[#F0FDF4] text-[#16A34A]">
            <BadgeCheck size={14} />
          </span>
          <span className="text-[10.5px] font-semibold text-[#64748B]">Payout sent</span>
        </div>
        <p className="mt-1.5 text-[19px] font-semibold tracking-[-0.02em] text-[#0F172A]">$842.00</p>
        <p className="text-[10.5px] text-[#94A3B8]">Arrived in 22 hours</p>
      </div>

      <div className="absolute -bottom-6 -left-2 z-10 hidden items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-[0_20px_44px_-22px_rgba(15,23,42,0.32)] sm:flex">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
          <TrendUp size={16} />
        </span>
        <span>
          <span className="block text-[10.5px] font-medium text-[#94A3B8]">Avg. EPC this week</span>
          <span className="block text-[14px] font-semibold text-[#0F172A]">
            $1.84 <span className="text-[10.5px] font-semibold text-[#16A34A]">+12.4%</span>
          </span>
        </span>
      </div>
    </div>
  );
}
