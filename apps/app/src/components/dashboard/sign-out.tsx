"use client";

import { LogOut } from "@leadxmedia/ui/icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function DashboardSignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await authClient.signOut();
        router.push("/login");
        router.refresh();
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-2.5 py-1.5 text-[12px] font-medium text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-60"
    >
      <LogOut size={14} aria-hidden />
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
