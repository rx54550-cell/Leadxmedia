import { cpaClick, cpaConversion, cpaOffer, cpaLead, click, offer, user } from "@leadxmedia/db";
import { and, eq, gte, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { createId } from "@/lib/id";
import { db } from "@/server/db";

const CONVERSION_STATUS = (raw: string | null) => {
  const s = (raw ?? "approved").toLowerCase();
  if (s === "approved" || s === "1" || s === "true" || s === "ok") return "APPROVED" as const;
  if (s === "rejected" || s === "declined" || s === "0" || s === "false") return "REJECTED" as const;
  return "PENDING" as const;
};

const startOfUtcDay = () => {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
};

/**
 * GET /api/postback?clickId=xxx&status=approved&payout=1.45
 *
 * Advertiser server-to-server callback for the publisher network:
 *  - finds the Click (404 when unknown)
 *  - creates the Conversion (one per click, so retries are safe)
 *  - on APPROVED, credits User.balance and User.totalEarned atomically
 * When CPA_POSTBACK_SECRET is set, ?secret= or X-Postback-Secret must match it.
 *
 * The legacy partner form (?click_id=&txid=) is still handled at the bottom.
 */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (p.get("clickId") || p.get("clickid")) return networkPostback(req);
  return legacyPostback(req);
}

async function networkPostback(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const secret = process.env.CPA_POSTBACK_SECRET;
  if (secret && (p.get("secret") ?? req.headers.get("x-postback-secret")) !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clickId = p.get("clickId") ?? p.get("clickid") ?? "";
  if (!clickId) return NextResponse.json({ error: "clickId is required" }, { status: 400 });

  const status = CONVERSION_STATUS(p.get("status"));
  const requestedPayout = p.get("payout");
  const payoutParam = requestedPayout === null ? null : Number(requestedPayout);
  if (payoutParam !== null && (!Number.isFinite(payoutParam) || payoutParam < 0 || payoutParam > 1_000_000)) {
    return NextResponse.json({ error: "Invalid payout" }, { status: 400 });
  }

  const [row] = await db()
    .select({ click: cpaClick, offer: cpaOffer })
    .from(cpaClick)
    .innerJoin(cpaOffer, eq(cpaClick.offerId, cpaOffer.id))
    .where(eq(cpaClick.id, clickId))
    .limit(1);
  if (!row) return NextResponse.json({ error: "Unknown clickId" }, { status: 404 });

  const payout = payoutParam ?? row.offer.payout;
  const postbackData = Object.fromEntries(p.entries());

  try {
    const result = await db().transaction(async (tx) => {
      // One conversion per click: the unique index turns a retry into a no-op instead of double pay.
      const [conversion] = await tx
        .insert(cpaConversion)
        .values({
          id: createId("cnv"),
          clickId,
          offerId: row.offer.id,
          userId: row.click.userId,
          payout,
          status,
          postbackData,
        })
        .returning({ id: cpaConversion.id });
      if (!conversion) throw new Error("Conversion insert returned no row");

      if (status === "APPROVED") {
        // daily cap: only count today's approved conversions for this offer
        if (row.offer.cap != null) {
          const [counted] = await tx
            .select({ n: sql<number>`count(*)::int` })
            .from(cpaConversion)
            .where(
              and(
                eq(cpaConversion.offerId, row.offer.id),
                eq(cpaConversion.status, "APPROVED"),
                gte(cpaConversion.createdAt, startOfUtcDay()),
              ),
            );
          if ((counted?.n ?? 0) > row.offer.cap) {
            throw new CapReached();
          }
        }
        await tx
          .update(user)
          .set({
            balance: sql`${user.balance} + ${payout}`,
            totalEarned: sql`${user.totalEarned} + ${payout}`,
          })
          .where(eq(user.id, row.click.userId));
      }
      return conversion.id;
    });
    return NextResponse.json({ ok: true, conversionId: result, clickId, status, payout });
  } catch (error) {
    if (error instanceof CapReached) {
      return NextResponse.json({ error: "Daily cap reached for this offer" }, { status: 409 });
    }
    if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true, clickId });
    }
    throw error;
  }
}

class CapReached extends Error {}

/** CPAHouse-compatible partner callback. Configure CPA_POSTBACK_SECRET before enabling it. */
async function legacyPostback(req: NextRequest) {
  const secret = process.env.CPA_POSTBACK_SECRET;
  if (!secret) return NextResponse.json({ error: "Postback is not configured" }, { status: 503 });
  const q = req.nextUrl.searchParams;
  if ((q.get("secret") ?? req.headers.get("x-postback-secret")) !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const clickId = q.get("click_id") ?? "";
  const transactionId = q.get("txid") ?? q.get("transaction_id") ?? q.get("sale_id") ?? "";
  const payout = Number(q.get("payout") ?? "0");
  const status = (q.get("status") ?? "").toLowerCase();
  if (!clickId || !transactionId || !Number.isFinite(payout) || payout < 0 || payout > 1_000_000) {
    return NextResponse.json({ error: "Invalid postback parameters" }, { status: 400 });
  }
  const [row] = await db()
    .select({ click, offer })
    .from(click)
    .innerJoin(offer, eq(click.offerId, offer.id))
    .where(eq(click.id, clickId))
    .limit(1);
  if (!row) return NextResponse.json({ error: "Unknown click_id" }, { status: 404 });
  const leadStatus =
    status === "approved" || status === "1" ? "approved" : status === "rejected" || status === "declined" ? "rejected" : "pending";
  try {
    await db().insert(cpaLead).values({
      id: createId("lead"),
      offerId: row.offer.id,
      partnerId: row.click.partnerId,
      clickId,
      transactionId,
      status: leadStatus,
      payoutAmount: Math.round(payout * 100),
      currency: row.offer.currency,
    });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    throw error;
  }
  return NextResponse.json({ ok: true, lead_id: transactionId });
}
