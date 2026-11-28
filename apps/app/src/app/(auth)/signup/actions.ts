"use server";

import { user } from "@leadxmedia/db";
import { eq } from "drizzle-orm";
import { getSession } from "@/server/auth";
import { db } from "@/server/db";

export type SignupRole = "publisher" | "advertiser";

/**
 * Saves the role chosen on the signup page. Better Auth creates the account first (it owns the
 * password/session), then this updates the same row the CPA dashboards read. The DB's CpaRole values
 * are uppercase, so the public lowercase choices are mapped here.
 */
export async function saveSignupRole(role: SignupRole) {
  if (role !== "publisher" && role !== "advertiser") {
    return { ok: false as const, error: "Choose Publisher or Advertiser to continue." };
  }
  const session = await getSession();
  if (!session) return { ok: false as const, error: "Please sign in again." };
  await db()
    .update(user)
    .set({ role: role === "advertiser" ? "ADVERTISER" : "PUBLISHER" })
    .where(eq(user.id, session.user.id));
  return { ok: true as const };
}
