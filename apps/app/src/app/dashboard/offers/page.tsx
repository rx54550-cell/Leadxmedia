import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OfferTable } from "@/components/dashboard/offer-table";
import { getSession } from "@/server/auth";
import { listOffers, offerFacets, type OfferFilters } from "@/server/network";

export const metadata: Metadata = { title: "Offers" };
export const dynamic = "force-dynamic";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

const selectClass =
  "h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-[12px] text-[#0F172A] outline-none focus:border-[#2563EB]";

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=%2Fdashboard%2Foffers");

  const sp = await searchParams;
  const filters: OfferFilters = {
    country: one(sp.country) || undefined,
    device: one(sp.device) || undefined,
    type: one(sp.type) || undefined,
    advertiser: one(sp.advertiser) || undefined,
    q: one(sp.q) || undefined,
  };

  const [offers, facets] = await Promise.all([listOffers(filters), offerFacets()]);
  const filtered = Boolean(filters.country || filters.device || filters.type || filters.advertiser || filters.q);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[22px] leading-7 font-semibold tracking-[-0.02em] text-[#0F172A]">CPA Offers</h1>
          <p className="mt-1 text-[13px] text-[#64748B]">
            {offers.length} live {offers.length === 1 ? "offer" : "offers"}
            {filtered ? " match your filters" : " in the network"}. Filters run against the database.
          </p>
        </div>
        {filtered ? (
          <Link
            href="/dashboard/offers"
            className="self-start rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-[12px] font-semibold text-[#334155] hover:bg-[#F8FAFC]"
          >
            Clear filters
          </Link>
        ) : null}
      </div>

      <form
        method="get"
        className="grid gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:grid-cols-2 lg:grid-cols-6"
      >
        <label className="space-y-1 text-[11px] font-semibold text-[#64748B]">
          Country
          <select name="country" defaultValue={filters.country ?? ""} className={selectClass}>
            <option value="">All countries</option>
            {facets.countries.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-[11px] font-semibold text-[#64748B]">
          Device
          <select name="device" defaultValue={filters.device ?? ""} className={selectClass}>
            <option value="">All devices</option>
            {facets.devices.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-[11px] font-semibold text-[#64748B]">
          Type
          <select name="type" defaultValue={filters.type ?? ""} className={selectClass}>
            <option value="">All types</option>
            {facets.types.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-[11px] font-semibold text-[#64748B]">
          Advertiser
          <select name="advertiser" defaultValue={filters.advertiser ?? ""} className={selectClass}>
            <option value="">All advertisers</option>
            {facets.advertisers.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-[11px] font-semibold text-[#64748B] sm:col-span-2 lg:col-span-2">
          Search
          <input
            type="search"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Offer name…"
            className="h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-2.5 text-[12px] text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#2563EB]"
          />
        </label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-6">
          <button
            type="submit"
            className="h-9 rounded-lg bg-[#2563EB] px-4 text-[12px] font-semibold text-white hover:bg-[#1D4ED8]"
          >
            Apply filters
          </button>
          <Link
            href="/dashboard/offers"
            className="inline-flex h-9 items-center rounded-lg border border-[#E2E8F0] bg-white px-4 text-[12px] font-semibold text-[#334155] hover:bg-[#F8FAFC]"
          >
            Reset
          </Link>
        </div>
      </form>

      <OfferTable
        offers={offers}
        empty={
          filtered
            ? "No live offers match these filters. Try a different country, device, type or advertiser."
            : "No live offers in the network yet. Seed the database to add inventory."
        }
      />

      <p className="text-[11px] text-[#94A3B8]">
        Rank follows creation date (oldest live offer first). Payouts are per approved conversion in USD. The
        Get Link button copies your tracking URL with your click id appended as subId.
      </p>
    </div>
  );
}
