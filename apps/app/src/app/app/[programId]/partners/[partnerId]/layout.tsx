import { partner } from "@openpromoter/db";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { programCtx } from "@/server/context";
import { db } from "@/server/db";

/**
 * Runs before loading.tsx starts streaming the skeleton, so a partner from another program (or no partner)
 * answers with a real HTTP 404. The same check in the page alone would arrive after a 200 was sent.
 */
export default async function PartnerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ programId: string; partnerId: string }>;
}) {
  const { programId, partnerId } = await params;
  await programCtx(programId);
  const [p] = await db()
    .select({ id: partner.id })
    .from(partner)
    .where(and(eq(partner.id, partnerId), eq(partner.programId, programId)));
  if (!p) notFound();
  return children;
}
