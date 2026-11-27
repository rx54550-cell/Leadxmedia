import { ArrowRight, Menu } from "@leadxmedia/ui/icons";
import Link from "next/link";

/**
 * Shared white + royal-blue marketing chrome.
 * Deliberately uses literal colours (not the app's dark "ledger" tokens) so the
 * public site stays white no matter which theme cookie the dashboard set.
 */

const NAV = [
  { href: "/network", label: "Offers" },
  { href: "/#advertisers", label: "Advertisers" },
  { href: "/#publishers", label: "Publishers" },
  { href: "/blog", label: "Blog" },
] as const;

export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        aria-hidden
        className="inline-flex size-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] shadow-[0_4px_12px_-4px_rgba(37,99,235,0.7)]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 17.5 10 11l3.2 3.2L20 7"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M15 7h5v5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-[19px] font-semibold tracking-[-0.03em]">
        <span className="text-[#0F172A]">Lead</span>
        <span className="text-[#2563EB]">XMedia</span>
      </span>
    </span>
  );
}

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#F1F5F9] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" aria-label="LeadXMedia home" className="shrink-0">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[13.5px] font-medium text-[#475569] hover:text-[#0F172A]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="hidden h-9 items-center rounded-lg border border-[#E2E8F0] bg-white px-4 text-[13px] font-semibold text-[#0F172A] hover:border-[#CBD5E1] hover:bg-[#F8FAFC] sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center rounded-lg bg-[#2563EB] px-4 text-[13px] font-semibold text-white hover:bg-[#1D4ED8]"
          >
            Sign up
          </Link>

          <details className="relative md:hidden">
            <summary
              aria-label="Open menu"
              className="flex size-9 cursor-pointer list-none items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC] [&::-webkit-details-marker]:hidden"
            >
              <Menu size={18} />
            </summary>
            <div className="absolute top-11 right-0 z-50 w-52 rounded-xl border border-[#E2E8F0] bg-white p-2 shadow-[0_20px_40px_-20px_rgba(15,23,42,0.25)]">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="mt-1 block rounded-lg border-t border-[#F1F5F9] px-3 py-2 text-[13px] font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] sm:hidden"
              >
                Log in
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

const FOOTER_COLS = [
  {
    title: "Network",
    links: [
      { href: "/network", label: "Offers" },
      { href: "/#publishers", label: "Publishers" },
      { href: "/#advertisers", label: "Advertisers" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/signup", label: "Create account" },
      { href: "/login", label: "Log in" },
      { href: "/partners", label: "Partner portal" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "mailto:hello@leadx.media", label: "Contact" },
      { href: "/network", label: "Browse offers" },
      { href: "/#advertisers", label: "Advertise with us" },
    ],
  },
] as const;

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#F1F5F9] bg-white">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href="/" aria-label="LeadXMedia home">
            <Wordmark />
          </Link>
          <p className="mt-4 max-w-[34ch] text-[13px] leading-6 text-[#64748B]">
            A premium CPA network for publishers and advertisers who care about clean traffic, real payouts and
            same-day reporting.
          </p>
          <Link
            href="/signup"
            className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
          >
            Start earning today
            <ArrowRight size={14} />
          </Link>
        </div>
        {FOOTER_COLS.map((col) => (
          <div key={col.title}>
            <p className="text-[12px] font-semibold tracking-wide text-[#0F172A] uppercase">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[13px] text-[#64748B] hover:text-[#0F172A]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-[#F1F5F9]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-5 py-6 text-[12px] text-[#94A3B8] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} LeadXMedia. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[#22C55E]" aria-hidden />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}
