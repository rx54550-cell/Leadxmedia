"use client";

import { Check, Copy } from "@leadxmedia/ui/icons";
import { useState } from "react";

/** Copies the publisher tracking link for an offer: {origin}/api/click?offerId=... */
export function GetLinkButton({ offerId }: { offerId: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        const url = `${window.location.origin}/api/click?offerId=${encodeURIComponent(offerId)}`;
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          window.prompt("Copy your tracking link", url);
        }
      }}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
        copied
          ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]"
          : "border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF]"
      }`}
      title="Copy a tracking link with your click id"
    >
      {copied ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
      {copied ? "Copied" : "Get Link"}
    </button>
  );
}
