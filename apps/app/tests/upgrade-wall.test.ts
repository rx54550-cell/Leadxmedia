import { describe, expect, it } from "vitest";
import { monthStart, mustUpgrade, OVER_MONTHS } from "@/server/billing-plans";

describe("upgrade wall", () => {
  it("asks only after every one of the last full months is over the limit", () => {
    expect(OVER_MONTHS).toBe(2);
    expect(mustUpgrade(100_000, [150_000, 120_000])).toBe(true);
    expect(mustUpgrade(100_000, [150_000, 90_000])).toBe(false); // one month under: still grace
    expect(mustUpgrade(100_000, [100_000, 100_000])).toBe(false); // at the limit is fine
    expect(mustUpgrade(100_000, [150_000])).toBe(false); // not enough history
  });

  it("counts full calendar months across the new year", () => {
    const now = new Date(Date.UTC(2027, 0, 15)); // Jan 15 2027
    expect(monthStart(0, now).toISOString()).toBe("2027-01-01T00:00:00.000Z");
    expect(monthStart(1, now).toISOString()).toBe("2026-12-01T00:00:00.000Z");
    expect(monthStart(2, now).toISOString()).toBe("2026-11-01T00:00:00.000Z");
  });
});
