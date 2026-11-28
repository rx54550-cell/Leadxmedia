import type { cpaOffer } from "@leadxmedia/db";
import { usd } from "@/lib/network-format";
import { GetLinkButton } from "./get-link";

type Offer = typeof cpaOffer.$inferSelect;

const DEVICE_STYLE: Record<string, string> = {
  iOS: "bg-[#EFF6FF] text-[#1D4ED8]",
  Android: "bg-[#F0FDF4] text-[#15803D]",
  Desktop: "bg-[#F8FAFC] text-[#475569]",
  All: "bg-[#F5F3FF] text-[#6D28D9]",
};

/**
 * The CPAlead-style offer table. Every cell comes from a cpa_offer row passed in by a server query;
 * the only client behaviour is copying a tracking link.
 */
export function OfferTable({ offers, empty }: { offers: Offer[]; empty?: string }) {
  if (!offers.length) {
    return (
      <div className="rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-8 text-center text-[13px] text-[#64748B]">
        {empty ?? "No offers match these filters yet."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
      <table className="w-full min-w-[940px] border-collapse text-left">
        <thead>
          <tr className="bg-[#F8FAFC] text-[11px] font-semibold tracking-[0.06em] text-[#64748B] uppercase">
            <th className="px-3 py-3">Rank</th>
            <th className="px-3 py-3">Offer</th>
            <th className="px-3 py-3">Device</th>
            <th className="px-3 py-3">Type</th>
            <th className="px-3 py-3">Country</th>
            <th className="px-3 py-3">Advertiser</th>
            <th className="px-3 py-3 text-right">Cap</th>
            <th className="px-3 py-3">Fast Pay</th>
            <th className="px-3 py-3 text-right">Payout</th>
            <th className="px-3 py-3 text-right">Link</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] bg-white">
          {offers.map((offer, i) => (
            <tr key={offer.id} className="align-middle hover:bg-[#F8FAFC]">
              <td className="px-3 py-3 text-[12px] font-semibold tabular-nums text-[#94A3B8]">
                {String(i + 1).padStart(2, "0")}
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-[#0F172A]">{offer.name}</span>
                  {offer.isLockerOnly ? (
                    <span className="rounded bg-[#FEF3C7] px-1.5 py-0.5 text-[10px] font-semibold text-[#92400E]">
                      Locker
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 max-w-[380px] truncate text-[11px] text-[#64748B]">{offer.description}</p>
              </td>
              <td className="px-3 py-3">
                <span
                  className={`rounded px-2 py-1 text-[11px] font-semibold ${
                    DEVICE_STYLE[offer.device] ?? "bg-[#F8FAFC] text-[#475569]"
                  }`}
                >
                  {offer.device}
                </span>
              </td>
              <td className="px-3 py-3 text-[12px] text-[#334155]">{offer.type}</td>
              <td className="px-3 py-3 text-[12px] font-medium text-[#334155]">{offer.country}</td>
              <td className="px-3 py-3 text-[12px] text-[#334155]">{offer.advertiserName}</td>
              <td className="px-3 py-3 text-right text-[12px] tabular-nums text-[#334155]">
                {offer.cap == null ? "Uncapped" : offer.cap.toLocaleString("en-US")}
              </td>
              <td className="px-3 py-3">
                {offer.isFastPay ? (
                  <span className="rounded bg-[#DCFCE7] px-2 py-1 text-[10px] font-semibold text-[#166534]">
                    Fast Pay
                  </span>
                ) : (
                  <span className="text-[11px] text-[#94A3B8]">Standard</span>
                )}
              </td>
              <td className="px-3 py-3 text-right text-[13px] font-semibold tabular-nums text-[#0F172A]">
                {usd(offer.payout)}
              </td>
              <td className="px-3 py-3 text-right">
                <GetLinkButton offerId={offer.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
