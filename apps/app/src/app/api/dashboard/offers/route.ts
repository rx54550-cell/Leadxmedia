import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { listOffers, offerFacets, type OfferFilters } from "@/server/network";

export const dynamic = "force-dynamic";

const one = (value: string | null) => value?.trim() || undefined;

/**
 * GET /api/dashboard/offers?country=US&device=iOS&type=SOI&advertiser=Playtika&q=slot
 *
 * Active network offers with the same database filters as the Offers page. Advertiser-only fields
 * (trackingUrl, postbackUrl) are intentionally omitted from the response.
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const filters: OfferFilters = {
    country: one(params.get("country")),
    device: one(params.get("device")),
    type: one(params.get("type")),
    advertiser: one(params.get("advertiser")),
    q: one(params.get("q")),
  };

  const [rows, facets] = await Promise.all([listOffers(filters), offerFacets()]);
  const offers = rows.map((offer) => ({
    id: offer.id,
    name: offer.name,
    description: offer.description,
    payout: offer.payout,
    cap: offer.cap,
    country: offer.country,
    device: offer.device,
    type: offer.type,
    advertiser: offer.advertiserName,
    isFastPay: offer.isFastPay,
    isLockerOnly: offer.isLockerOnly,
    createdAt: offer.createdAt,
  }));

  return NextResponse.json(
    { offers, facets },
    { headers: { "Cache-Control": "no-store" } },
  );
}
