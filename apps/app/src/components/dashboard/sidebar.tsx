"use client";

import {
  BookOpen,
  ChartLine,
  Coins,
  Globe,
  KeyRound,
  LayoutDashboard,
  Layers,
  Link2,
  Megaphone,
  Settings2,
  Store,
  Webhook,
  type LucideIcon,
} from "@leadxmedia/ui/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/offers", label: "Offers", icon: Coins },
  { href: "/dashboard/statistics", label: "Statistics", icon: ChartLine },
  { href: "/dashboard/lockers", label: "Lockers", icon: KeyRound },
  { href: "/dashboard/landing-pages", label: "Landing Pages", icon: Layers },
  { href: "/dashboard/offer-wall", label: "Offer Wall", icon: Store },
  { href: "/dashboard/postback", label: "Postback", icon: Webhook },
  { href: "/dashboard/account", label: "Account", icon: Settings2 },
  { href: "/dashboard/help", label: "Help", icon: BookOpen },
  { href: "/dashboard/advertise", label: "Advertise", icon: Megaphone },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  return (
    <aside className="bg-[#0B1220] text-[#CBD5E1] lg:min-h-dvh">
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-[11px] font-bold tracking-[-0.06em] text-white">
          LX
        </span>
        <span className="text-[15px] font-semibold tracking-[-0.02em] text-white">
          LeadX<span className="font-normal text-[#94A3B8]">Media</span>
        </span>
        <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-[#CBD5E1]">
          CPA
        </span>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-0.5 lg:overflow-visible lg:pb-6">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-[#2563EB] text-white"
                  : "text-[#CBD5E1] hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Icon size={17} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden px-5 lg:block">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-white">
            <Globe size={14} className="text-[#60A5FA]" aria-hidden />
            Network status
          </div>
          <p className="mt-1.5 text-[11px] leading-4 text-[#94A3B8]">
            Tracking and postbacks are live. Payouts are reviewed within 24 hours.
          </p>
          <Link
            href="/dashboard/postback"
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#60A5FA] hover:text-white"
          >
            <Link2 size={12} aria-hidden /> Set up postback
          </Link>
        </div>
      </div>
    </aside>
  );
}
