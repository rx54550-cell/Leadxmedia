import { OFFER_CATEGORIES, offer } from "@openpromoter/db";
import { desc, eq } from "drizzle-orm";
import { PageHeader } from "@/components/page";
import { programCtx } from "@/server/context";
import { db } from "@/server/db";
import { createId } from "@/lib/id";
import { revalidatePath } from "next/cache";

export const metadata = { title: "Offers · LeadX Media" };

export default async function OffersPage({ params }: { params: Promise<{ programId: string }> }) {
  const { programId } = await params;
  const { program: prog } = await programCtx(programId, "program.write");
  const rows = await db().select().from(offer).where(eq(offer.workspaceId, prog.workspaceId)).orderBy(desc(offer.createdAt));
  async function addOffer(form: FormData) {
    "use server";
    const { program: p } = await programCtx(programId, "program.write");
    const name = String(form.get("name") ?? "").trim();
    const category = String(form.get("category") ?? "");
    const payoutType = String(form.get("payoutType") ?? "");
    const payout = Number(form.get("payout"));
    const trackingUrl = String(form.get("trackingUrl") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const status = String(form.get("status") ?? "paused");
    const geos = String(form.get("geos") ?? "").split(",").map((x) => x.trim().toUpperCase()).filter(Boolean);
    if (!name || !(OFFER_CATEGORIES as readonly string[]).includes(category) || !["CPL", "CPA", "CPI"].includes(payoutType) || !Number.isSafeInteger(payout) || payout < 0 || !/^https:\/\//i.test(trackingUrl) || !["active", "paused"].includes(status)) throw new Error("Invalid offer details");
    await db().insert(offer).values({ id: createId("off"), workspaceId: p.workspaceId, name, category: category as (typeof OFFER_CATEGORIES)[number], payoutType: payoutType as "CPL" | "CPA" | "CPI", payoutAmount: payout, currency: p.currency, geos, trackingUrl, description, status: status as "active" | "paused" });
    revalidatePath(`/app/${programId}/offers`);
  }
  return <main className="mx-auto max-w-6xl space-y-6 p-6"><PageHeader title="Offers" description="Manage your CPA offers."/><form action={addOffer} className="grid gap-3 rounded-xl border p-5 md:grid-cols-3"><h2 className="font-semibold md:col-span-3">Add Offer</h2><input name="name" required placeholder="Offer Name" className="rounded border p-2"/><select name="category" className="rounded border p-2">{OFFER_CATEGORIES.map((c)=><option key={c}>{c}</option>)}</select><select name="payoutType" className="rounded border p-2"><option>CPL</option><option>CPA</option><option>CPI</option></select><input name="payout" type="number" min="0" required placeholder="Payout (minor currency units)" className="rounded border p-2"/><input name="geos" placeholder="GEOs, e.g. BD, ID, US" className="rounded border p-2"/><input name="trackingUrl" type="url" required placeholder="Advertiser tracking URL (https://...)" className="rounded border p-2"/><textarea name="description" placeholder="Description" className="rounded border p-2 md:col-span-2"/><select name="status" className="rounded border p-2"><option value="active">Active</option><option value="paused">Paused</option></select><button className="rounded bg-[var(--accent)] px-4 py-2 font-medium text-white md:col-span-3">Add Offer</button></form><section className="overflow-x-auto rounded-xl border"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Offer</th><th className="p-3">Category</th><th className="p-3">Payout</th><th className="p-3">GEO</th><th className="p-3">Status</th></tr></thead><tbody>{rows.map(o=><tr key={o.id} className="border-b"><td className="p-3">{o.name}<div className="text-muted">{o.description}</div></td><td className="p-3">{o.category}</td><td className="p-3">{o.payoutType} · {(o.payoutAmount/100).toFixed(2)} {o.currency.toUpperCase()}</td><td className="p-3">{o.geos.join(", ") || "All"}</td><td className="p-3">{o.status}</td></tr>)}</tbody></table>{!rows.length&&<p className="p-6 text-muted">No offers yet.</p>}</section></main>;
}
