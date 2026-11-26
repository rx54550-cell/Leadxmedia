import { payout } from "@leadxmedia/db";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { partnerCtx } from "@/server/context";
import { db } from "@/server/db";

/**
 * Runs before loading.tsx starts streaming the skeleton, so another partner's payout (or none) answers with a
 * real HTTP 404. The same check in the page alone would arrive after a 200 was sent.
 */
export default async function PartnerPayoutLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; payoutId: string }>;
}) {
  const { slug, payoutId } = await params;
  const { partner: pt } = await partnerCtx(slug);
  const [po] = await db()
    .select({ id: payout.id })
    .from(payout)
    .where(and(eq(payout.id, payoutId), eq(payout.partnerId, pt.id)));
  if (!po) notFound();
  return children;
}
