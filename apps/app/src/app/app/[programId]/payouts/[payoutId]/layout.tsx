import { payout } from "@openpromoter/db";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { programCtx } from "@/server/context";
import { db } from "@/server/db";

/**
 * Runs before loading.tsx starts streaming the skeleton, so a payout from another program (or none) answers
 * with a real HTTP 404, for the payout and its invoice. The same check in a page arrives after a 200 was sent.
 */
export default async function PayoutLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ programId: string; payoutId: string }>;
}) {
  const { programId, payoutId } = await params;
  await programCtx(programId);
  const [po] = await db()
    .select({ id: payout.id })
    .from(payout)
    .where(and(eq(payout.id, payoutId), eq(payout.programId, programId)));
  if (!po) notFound();
  return children;
}
