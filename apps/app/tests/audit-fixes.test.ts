import { campaign, commission, partner, program, referral } from "@openpromoter/db";
import { and, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { percentBp, toMajor } from "@/lib/money";
import { SYSTEM } from "@/server/audit";
import type { BillingEvent, ParsedWebhook } from "@/server/billing/types";
import { monthlyUsage } from "@/server/billing-plans";
import { contestStandings, evaluateTiers } from "@/server/campaigns";
import { db } from "@/server/db";
import { ingest } from "@/server/ingest";
import { reverseCommissions } from "@/server/ledger";
import { recordClick, recordLead } from "@/server/tracking";
import { addPartner, fixture } from "./helpers";

let n = 0;
const evt = (events: BillingEvent[]): ParsedWebhook => ({
  eventId: `evt_audit_${++n}`,
  eventType: "t",
  livemode: true,
  events,
});
const pay = (customerId: string, paymentId: string, chargeIds: string[]): BillingEvent => ({
  type: "payment",
  paymentId,
  chargeIds,
  customerId,
  email: null,
  subscriptionId: "sub_1",
  amount: 10000,
  currency: "usd",
  interval: "month",
  intervalCount: 1,
  paidAt: new Date(),
  attribution: {},
  description: "Pro",
});

/** A partner with one referred customer who paid $100 `payments` times. */
async function referred(customer: string, payments: number) {
  const f = await fixture();
  const p = await addPartner(f.program.id, f.ws.id);
  const click = await recordClick({
    programId: f.program.id,
    code: p.code,
    landingUrl: `https://acme.test/?via=${p.code}`,
    userAgent: "Mozilla/5.0",
    ip: "1.2.3.4",
  });
  await ingest(
    f.ws.id,
    "stripe",
    evt([
      {
        type: "checkout",
        customerId: customer,
        email: null,
        name: null,
        subscriptionId: "sub_1",
        attribution: { clientReferenceId: click!.clickId },
      },
    ]),
  );
  for (let i = 1; i <= payments; i++)
    await ingest(
      f.ws.id,
      "stripe",
      evt([pay(customer, `in_${customer}_${i}`, [`ch_${customer}_${i}`, `pi_${customer}_${i}`])]),
    );
  return { f, p };
}

describe("audit fixes", () => {
  it("a full Stripe refund reported under the charge and the payment intent cuts revenue once", async () => {
    const { f } = await referred("cus_dbl", 2);
    const id = "ch_cus_dbl_2";
    await ingest(
      f.ws.id,
      "stripe",
      evt([
        { type: "refund", chargeId: id, refundKey: `${id}:10000`, refunded: 10000, charged: 10000 },
        {
          type: "refund",
          chargeId: "pi_cus_dbl_2",
          refundKey: `${id}:10000`,
          refunded: 10000,
          charged: 10000,
        },
      ]),
    );
    const [r] = await db().select().from(referral).where(eq(referral.externalCustomerId, "cus_dbl"));
    expect(r?.revenue).toBe(10000);
  });

  it("reversed sales leave contests, tiers and plan usage", async () => {
    const { f, p } = await referred("cus_rev", 1);
    const [c] = await db()
      .insert(campaign)
      .values({
        id: "cmp_audit",
        programId: f.program.id,
        name: "C",
        description: "",
        rule: { kind: "contest", prizes: [5000], metric: "revenue" } as never,
        status: "active",
        startsAt: new Date(Date.now() - 86_400_000),
        endsAt: new Date(Date.now() + 86_400_000),
      })
      .returning();
    expect((await monthlyUsage(f.ws.id)) > 0).toBe(true);
    const [sale] = await db()
      .select()
      .from(commission)
      .where(and(eq(commission.partnerId, p.id), eq(commission.kind, "sale")));
    await reverseCommissions(f.program.id, [sale!.id], "fraud", SYSTEM);
    expect((await contestStandings(c!)).filter((s) => s.value > 0)).toEqual([]);
    expect(await monthlyUsage(f.ws.id)).toBe(0);
    await evaluateTiers(f.program.id, p.id); // no promotion and no throw on zero revenue
    const [after] = await db().select().from(partner).where(eq(partner.id, p.id));
    expect(after?.groupId).toBe(p.groupId);
  });

  it("caps percent rates at 100 and shows zero-decimal overrides as typed", () => {
    expect(percentBp("12.5")).toBe(1250);
    expect(percentBp(100)).toBe(10000);
    expect(() => percentBp("300")).toThrow(/at most 100/);
    expect(toMajor(500, "jpy")).toBe("500");
    expect(toMajor(1500, "kwd")).toBe("1.500");
    void program;
  });

  it("a browser click vouches for one fresh signup, and an old link lead can't claim a later payment", async () => {
    const f = await fixture();
    const p = await addPartner(f.program.id, f.ws.id);
    const click = await recordClick({
      programId: f.program.id,
      code: p.code,
      landingUrl: `https://acme.test/?via=${p.code}`,
      userAgent: "Mozilla/5.0",
      ip: "1.2.3.4",
    });
    const lead = (email: string) =>
      recordLead({ programId: f.program.id, email, clickId: click!.clickId, browser: true, ip: "1.2.3.4" });
    expect(await lead("real@visitor.test")).toMatchObject({ partnerId: p.id });
    // the same public click id can't be reused for other people's emails, nor found again by visitor id
    expect(await lead("victim@other.test")).toBeNull();
    expect(
      await recordLead({
        programId: f.program.id,
        email: "victim2@other.test",
        visitorId: click!.visitorId,
        clickId: "clk_made_up",
        browser: true,
      }),
    ).toBeNull();

    // the real lead is older than the 60-day window when the customer finally pays
    await db()
      .update(referral)
      .set({ createdAt: new Date(Date.now() - 61 * 86_400_000) })
      .where(eq(referral.email, "real@visitor.test"));
    await ingest(
      f.ws.id,
      "stripe",
      evt([{ ...pay("cus_late", "in_late", ["ch_late"]), email: "real@visitor.test" } as BillingEvent]),
    );
    expect(await db().select().from(commission).where(eq(commission.partnerId, p.id))).toEqual([]);

    // control: a fresh click and lead still earn on the customer's payment
    const fresh = await recordClick({
      programId: f.program.id,
      code: p.code,
      landingUrl: `https://acme.test/?via=${p.code}`,
      userAgent: "Mozilla/5.0",
      ip: "1.2.3.5",
    });
    await recordLead({
      programId: f.program.id,
      email: "new@visitor.test",
      clickId: fresh!.clickId,
      browser: true,
    });
    await ingest(
      f.ws.id,
      "stripe",
      evt([{ ...pay("cus_new", "in_new", ["ch_new"]), email: "new@visitor.test" } as BillingEvent]),
    );
    expect(await db().select().from(commission).where(eq(commission.partnerId, p.id))).toHaveLength(1);
  });
});
