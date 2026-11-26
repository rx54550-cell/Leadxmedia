"use client";

import { Button, Card, EmptyState } from "@leadxmedia/ui";
import { CreditCard } from "@leadxmedia/ui/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Pages that stay open behind the upgrade screen: plans and settings, and payouts so partners still get paid. */
const OPEN = ["/settings", "/payouts"];

/**
 * Shown in place of the dashboard after two full months over the plan's revenue limit (server/billing-plans.ts).
 * Tracking, the partner portal and payouts never stop. Only the founder's dashboard asks for the upgrade.
 */
export function UpgradeWall({
  programId,
  planName,
  limit,
  lastMonth,
  owner,
  children,
}: {
  programId: string;
  planName: string;
  limit: string;
  lastMonth: string;
  owner: boolean;
  children: React.ReactNode;
}) {
  const path = usePathname();
  if (OPEN.some((p) => path.startsWith(`/app/${programId}${p}`))) return <>{children}</>;
  return (
    <Card>
      <EmptyState
        icon={CreditCard}
        title="Your program has outgrown its plan"
        description={
          <>
            Your partners brought in {lastMonth} last month. The {planName} plan covers {limit} a month and
            you were over it for two months in a row. Tracking, payouts and your partner portal keep working.
            {owner
              ? " Choose a plan to open the rest of your dashboard."
              : " Ask the workspace owner to choose a plan."}
          </>
        }
        action={
          <div className="flex flex-wrap justify-center gap-2">
            {owner ? (
              <Button asChild variant="primary">
                <Link href={`/app/${programId}/settings/billing`}>Choose a plan</Link>
              </Button>
            ) : null}
            <Button asChild variant="secondary">
              <Link href={`/app/${programId}/payouts`}>Go to payouts</Link>
            </Button>
          </div>
        }
      />
    </Card>
  );
}
