import { cpaClick, cpaConversion, cpaOffer, user } from "@leadxmedia/db";
import { describe, expect, it } from "vitest";
import { createId } from "@/lib/id";
import { db } from "@/server/db";
import { dailyPerformance, publisherOverview } from "@/server/network";

const utcDay = (offset: number) => {
  const n = new Date();
  const day = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
  day.setUTCDate(day.getUTCDate() + offset);
  return day;
};

async function fixture() {
  const userId = crypto.randomUUID();
  await db().insert(user).values({
    id: userId,
    name: "Publisher",
    email: `publisher-${crypto.randomUUID()}@network.test`,
    balance: 5,
    totalEarned: 10,
  });
  const [offer] = await db()
    .insert(cpaOffer)
    .values({
      id: createId("off"),
      name: "Test Offer",
      payout: 1.45,
      advertiserName: "Test Advertiser",
      trackingUrl: "https://advertiser.test/offer",
    })
    .returning();
  return { userId, offer: offer! };
}

async function addClick(userId: string, offerId: string, createdAt: Date) {
  const id = createId("clk");
  await db().insert(cpaClick).values({ id, offerId, userId, createdAt });
  return id;
}

async function addConversion(
  clickId: string,
  offerId: string,
  userId: string,
  payout: number,
  status: "APPROVED" | "PENDING" | "REJECTED",
  createdAt: Date,
) {
  await db().insert(cpaConversion).values({
    id: createId("cnv"),
    clickId,
    offerId,
    userId,
    payout,
    status,
    createdAt,
  });
}

describe("publisher network statistics", () => {
  it("groups clicks, conversions and approved earnings by UTC day", async () => {
    const { userId, offer } = await fixture();
    const today = utcDay(0);
    const yesterday = utcDay(-1);
    const at = (day: Date, hour: number) => new Date(day.getTime() + hour * 3_600_000);

    const todayClick1 = await addClick(userId, offer.id, at(today, 1));
    const todayClick2 = await addClick(userId, offer.id, at(today, 2));
    const yesterdayClick = await addClick(userId, offer.id, at(yesterday, 3));

    await addConversion(todayClick1, offer.id, userId, 1.45, "APPROVED", at(today, 1));
    await addConversion(todayClick2, offer.id, userId, 2.1, "REJECTED", at(today, 2));
    await addConversion(yesterdayClick, offer.id, userId, 0.68, "PENDING", at(yesterday, 3));

    const rows = await dailyPerformance(userId, 7);
    expect(rows).toHaveLength(7);
    expect(rows.map((r) => r.date)).toEqual(
      Array.from({ length: 7 }, (_, i) => utcDay(i - 6).toISOString().slice(0, 10)),
    );

    const todayRow = rows.at(-1)!;
    expect(todayRow).toEqual({
      date: today.toISOString().slice(0, 10),
      clicks: 2,
      conversions: 2,
      earnings: 1.45,
    });

    const yesterdayRow = rows.at(-2)!;
    expect(yesterdayRow).toEqual({
      date: yesterday.toISOString().slice(0, 10),
      clicks: 1,
      conversions: 1,
      earnings: 0,
    });

    // Empty days are real zero rows from the query, not invented by the page.
    for (const row of rows.slice(0, 5)) {
      expect(row.clicks).toBe(0);
      expect(row.conversions).toBe(0);
      expect(row.earnings).toBe(0);
    }

    const overview = await publisherOverview(userId);
    expect(overview.todayClicks).toBe(2);
    expect(overview.totalClicks).toBe(3);
    expect(overview.todayEarnings).toBe(1.45);
    expect(overview.totalEarnings).toBe(1.45);
    expect(overview.pendingEarnings).toBe(0.68);
    expect(overview.balance).toBe(5);
    expect(overview.lifetimeCredited).toBe(10);
  });

  it("returns zero rows for a publisher with no traffic", async () => {
    const { userId } = await fixture();
    const rows = await dailyPerformance(userId, 7);
    expect(rows).toHaveLength(7);
    expect(rows.every((r) => r.clicks === 0 && r.conversions === 0 && r.earnings === 0)).toBe(true);
  });
});
