import { emailLog, user, workspace } from "@leadxmedia/db";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SYSTEM } from "@/server/audit";
import { db } from "@/server/db";
import { sendMail } from "@/server/email";
import { env } from "@/server/env";
import {
  applyToProgram,
  assertFounderVerified,
  FREE_INVITES_PER_DAY,
  overInviteLimit,
  setPartnerStatus,
} from "@/server/partners";
import { addPartner, fixture } from "./helpers";

const prev = env.HOSTED_MODE;
beforeAll(() => {
  (env as { HOSTED_MODE?: string }).HOSTED_MODE = "true";
});
afterAll(() => {
  (env as { HOSTED_MODE?: string }).HOSTED_MODE = prev;
});

const invite = (prog: Parameters<typeof applyToProgram>[0], source: "invite" | "api" = "invite") =>
  applyToProgram(prog, { email: `n-${Math.random()}@partner.test`, name: "New", source }, true);

describe("free invite limit", () => {
  it("stops Free at the daily limit and never stops paid plans", () => {
    expect(FREE_INVITES_PER_DAY).toBe(50);
    expect(overInviteLimit("free", 49)).toBe(false);
    expect(overInviteLimit("free", 50)).toBe(true);
    expect(overInviteLimit("starter", 5_000)).toBe(false);
  });

  it("refuses the 51st invite of the day on Free and allows it after an upgrade", async () => {
    const f = await fixture();
    for (let i = 0; i < FREE_INVITES_PER_DAY; i++) await invite(f.program, i % 2 ? "invite" : "api");
    // an embedded-dashboard sign-in and a self-applied partner don't count
    await applyToProgram(f.program, { email: "embed@app.test", name: "E", source: "api" }, true, false);
    await applyToProgram(f.program, { email: "self@apply.test", name: "S" });
    await expect(invite(f.program)).rejects.toThrow(/50 partner invites a day/);
    await db().update(workspace).set({ plan: "starter" }).where(eq(workspace.id, f.ws.id));
    await expect(invite(f.program)).resolves.toMatchObject({ autoApproved: true });
  });

  it("approving imported partners counts toward the limit and needs a confirmed email", async () => {
    const f = await fixture();
    const imported = await Promise.all(
      Array.from({ length: FREE_INVITES_PER_DAY + 1 }, () =>
        addPartner(f.program.id, f.ws.id, { source: "import", status: "paused" }),
      ),
    );
    const ids = imported.map((p) => p.id);
    await expect(setPartnerStatus(f.program.id, ids, "approved", SYSTEM, f.user)).rejects.toThrow(
      /Confirm your email/,
    );
    await db().update(user).set({ emailVerified: true }).where(eq(user.id, f.user.id));
    await expect(setPartnerStatus(f.program.id, ids, "approved", SYSTEM, f.user)).rejects.toThrow(
      /50 partner invites a day/,
    );
    await setPartnerStatus(f.program.id, ids.slice(0, FREE_INVITES_PER_DAY), "approved", SYSTEM, f.user);
    await expect(invite(f.program)).rejects.toThrow(/50 partner invites a day/);
    // approving someone who applied themselves never counts
    const applicant = await addPartner(f.program.id, f.ws.id, { source: "application", status: "pending" });
    await expect(
      setPartnerStatus(f.program.id, [applicant.id], "approved", SYSTEM, f.user),
    ).resolves.toHaveLength(1);
  });

  it("asks an unconfirmed founder to confirm their email first", async () => {
    const f = await fixture();
    await expect(assertFounderVerified(f.user)).rejects.toThrow(/Confirm your email/);
  });
});

describe("blocked addresses", () => {
  it("matches the log whatever the case, and lets sign-in emails past a complaint but not a hard bounce", async () => {
    await db()
      .insert(emailLog)
      .values([
        { id: "eml_case", to: "bob@case.test", subject: "a", status: "bounced", detail: "Permanent General" },
        { id: "eml_spam", to: "amy@spam.test", subject: "a", status: "complained" },
      ]);
    const send = (to: string, account = false) =>
      sendMail({ to, subject: "Again", html: "<p>x</p>", text: "x", account });
    const last = async (to: string) =>
      (await db().select().from(emailLog).where(eq(emailLog.to, to))).find((r) => r.subject === "Again");
    await send("Bob@Case.test");
    expect(await last("bob@case.test")).toMatchObject({ status: "not_sent" });
    await send("bob@case.test", true);
    expect(
      (await db().select().from(emailLog).where(eq(emailLog.to, "bob@case.test")))
        .filter((r) => r.subject === "Again")
        .every((r) => r.status === "not_sent"),
    ).toBe(true);
    await send("amy@spam.test", true);
    expect((await last("amy@spam.test"))?.detail).not.toBe("Address bounced or complained before");
  });
});
