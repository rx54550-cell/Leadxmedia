import { cpaClick, cpaOffer, click, offer, partner } from "@leadxmedia/db";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { clientIp } from "@/lib/client-ip";
import { hashIp } from "@/lib/crypto";
import { createId } from "@/lib/id";
import { getSession } from "@/server/auth";
import { db } from "@/server/db";
import { limit } from "@/server/ratelimit";

/**
 * GET /api/click?offerId=xxx&subId=yyy
 *
 * Publisher-facing tracking link. Requires a Better Auth session, records a real Click row with the
 * caller's IP and user agent, then forwards to the offer's tracking URL with subId=<clickId>.
 * Add &format=json to receive { clickId, url } instead of the redirect.
 *
 * The legacy partner-portal form (?offer_id=&pub_id=&sub1=) is still handled below.
 */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const networkOfferId = p.get("offerId") ?? p.get("offer_id_network");
  if (networkOfferId) return networkClick(req, networkOfferId);
  return legacyClick(req);
}

async function networkClick(req: NextRequest, offerId: string) {
  const p = req.nextUrl.searchParams;
  const session = await getSession();
  if (!session) {
    const next = `/api/click?${p.toString()}`;
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}`, req.url), 302);
  }

  const [row] = await db()
    .select()
    .from(cpaOffer)
    .where(and(eq(cpaOffer.id, offerId), eq(cpaOffer.isActive, true)))
    .limit(1);
  if (!row) return NextResponse.json({ error: "Offer not found or paused" }, { status: 404 });

  const ip = clientIp(req);
  if (!(await limit(`network-click:${ip ?? "unknown"}`, 120, 60_000)).ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const id = createId("clk");
  const userAgent = req.headers.get("user-agent")?.slice(0, 500) ?? null;
  const country =
    (req.headers.get("x-vercel-ip-country") ?? req.headers.get("cf-ipcountry"))?.toUpperCase() ?? null;
  const subId = (p.get("subId") ?? p.get("subid") ?? p.get("sub1"))?.slice(0, 120) || null;

  await db().insert(cpaClick).values({
    id,
    offerId: row.id,
    userId: session.user.id,
    ip,
    userAgent,
    country,
    subId,
  });

  const destination = new URL(row.trackingUrl);
  destination.searchParams.set("subId", id);

  if (p.get("format") === "json" || req.headers.get("accept")?.includes("application/json")) {
    return NextResponse.json({ clickId: id, url: destination.toString(), offerId: row.id });
  }
  return NextResponse.redirect(destination, 302);
}

/** Partner portal tracking link: workspace-scoped offer + approved partner. */
async function legacyClick(req: NextRequest) {
  const offerId = req.nextUrl.searchParams.get("offer_id") ?? "";
  const pubId = req.nextUrl.searchParams.get("pub_id") ?? "";
  const sub = req.nextUrl.searchParams.get("sub1")?.slice(0, 120) ?? null;
  const [o, p] = await Promise.all([
    db()
      .select()
      .from(offer)
      .where(and(eq(offer.id, offerId), eq(offer.status, "active")))
      .limit(1),
    db()
      .select()
      .from(partner)
      .where(and(eq(partner.id, pubId), eq(partner.status, "approved")))
      .limit(1),
  ]);
  if (!o[0] || !p[0] || o[0].workspaceId !== p[0].workspaceId) {
    return NextResponse.json({ error: "Offer or publisher unavailable" }, { status: 404 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await limit(`cpa-click:${ip}`, 120, 60_000)).ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const id = createId("clk");
  const userAgent = req.headers.get("user-agent")?.slice(0, 500) ?? null;
  const destination = new URL(o[0].trackingUrl);
  destination.searchParams.set("click_id", id);
  destination.searchParams.set("sub1", sub ?? "");
  await db().insert(click).values({
    id,
    programId: p[0].programId,
    partnerId: p[0].id,
    offerId: o[0].id,
    linkId: null,
    visitorId: id,
    ipHash: hashIp(ip),
    userAgent,
    referrer: req.headers.get("referer"),
    landingUrl: o[0].trackingUrl,
    country: null,
    subId: sub,
    utm: null,
    isBot: /bot|crawler|spider/i.test(userAgent ?? ""),
  });
  return NextResponse.redirect(destination, 302);
}
