import type Stripe from "stripe";
import { describe, expect, it } from "vitest";
import { lookupKey, monthlyValue, yearlyPrice } from "@/lib/plans";
import { applyPlanSubscription, planStatus } from "@/server/billing-plans";
import { fixture } from "./helpers";

const sub = (wsId: string, lookup: string, interval: "month" | "year", status = "active") =>
  ({
    id: "sub_y",
    customer: "cus_y",
    status,
    metadata: { workspace_id: wsId, plan: "growth" },
    trial_end: null,
    cancel_at: null,
    cancel_at_period_end: false,
    items: { data: [{ price: { lookup_key: lookup, recurring: { interval } }, current_period_end: 0 }] },
  }) as unknown as Stripe.Subscription;

describe("yearly billing", () => {
  it("prices yearly at 2 months free and counts it as a twelfth for MRR", () => {
    expect(yearlyPrice(2900)).toBe(29000);
    expect(monthlyValue(7900, "year")).toBe(6583);
    expect(monthlyValue(7900, "month")).toBe(7900);
    expect(monthlyValue(7900, null)).toBe(7900);
    expect(lookupKey("scale")).toBe("leadxmedia_scale_monthly");
    expect(lookupKey("scale", "year")).toBe("leadxmedia_scale_yearly");
  });

  it("the webhook reads the plan from a yearly price and stores the interval; it clears when the plan ends", async () => {
    const f = await fixture();
    await applyPlanSubscription(sub(f.ws.id, "leadxmedia_growth_yearly", "year"));
    expect(await planStatus(f.ws.id)).toMatchObject({ plan: { id: "growth" }, interval: "year" });
    // switched to monthly in the Stripe portal
    await applyPlanSubscription(sub(f.ws.id, "leadxmedia_growth_monthly", "month"));
    expect((await planStatus(f.ws.id)).interval).toBe("month");
    await applyPlanSubscription(sub(f.ws.id, "leadxmedia_growth_yearly", "year", "canceled"));
    expect(await planStatus(f.ws.id)).toMatchObject({ plan: { id: "free" }, interval: null });
  });
});
