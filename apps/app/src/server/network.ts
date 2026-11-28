import {
  cpaClick,
  cpaConversion,
  cpaOffer,
  cpaPayoutRequest,
  user,
  type CpaDevice,
  type CpaOfferType,
} from "@leadxmedia/db";
import { and, asc, desc, eq, ilike, sql, type SQL } from "drizzle-orm";
import { db, query } from "./db";

/** Server-side offer filters. Every one of these becomes a real SQL predicate. */
export type OfferFilters = {
  country?: string;
  device?: string;
  type?: string;
  advertiser?: string;
  q?: string;
  /** Only content-locker offers. */
  lockerOnly?: boolean;
};

const clean = (v: string | undefined) => v?.trim() || undefined;

function offerConditions(f: OfferFilters): SQL[] {
  const where: SQL[] = [eq(cpaOffer.isActive, true)];
  const country = clean(f.country);
  const device = clean(f.device);
  const type = clean(f.type);
  const advertiser = clean(f.advertiser);
  const q = clean(f.q);
  if (country) where.push(eq(cpaOffer.country, country));
  if (device) where.push(eq(cpaOffer.device, device as CpaDevice));
  if (type) where.push(eq(cpaOffer.type, type as CpaOfferType));
  if (advertiser) where.push(eq(cpaOffer.advertiserName, advertiser));
  if (q) where.push(ilike(cpaOffer.name, `%${q}%`));
  if (f.lockerOnly) where.push(eq(cpaOffer.isLockerOnly, true));
  return where;
}

/** Active offers, newest last so Rank 1 is the oldest live offer (deterministic createdAt order). */
export async function listOffers(f: OfferFilters = {}, limit?: number) {
  const q = db()
    .select()
    .from(cpaOffer)
    .where(and(...offerConditions(f)))
    .orderBy(asc(cpaOffer.createdAt));
  return limit ? q.limit(limit) : q;
}

/** Filter options come from the offers themselves, so a dropdown can never offer an empty result set. */
export async function offerFacets() {
  const active = eq(cpaOffer.isActive, true);
  const [countries, devices, types, advertisers] = await Promise.all([
    db()
      .selectDistinct({ value: cpaOffer.country })
      .from(cpaOffer)
      .where(active)
      .orderBy(asc(cpaOffer.country)),
    db().selectDistinct({ value: cpaOffer.device }).from(cpaOffer).where(active).orderBy(asc(cpaOffer.device)),
    db().selectDistinct({ value: cpaOffer.type }).from(cpaOffer).where(active).orderBy(asc(cpaOffer.type)),
    db()
      .selectDistinct({ value: cpaOffer.advertiserName })
      .from(cpaOffer)
      .where(active)
      .orderBy(asc(cpaOffer.advertiserName)),
  ]);
  return {
    countries: countries.map((r) => r.value),
    devices: devices.map((r) => r.value),
    types: types.map((r) => r.value),
    advertisers: advertisers.map((r) => r.value),
  };
}

export type PublisherOverview = {
  todayEarnings: number;
  mtdEarnings: number;
  totalEarnings: number;
  todayClicks: number;
  totalClicks: number;
  totalConversions: number;
  pendingEarnings: number;
  balance: number;
  lifetimeCredited: number;
};

const startOfUtcDay = () => {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
};

const startOfUtcMonth = () => {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 1));
};

/** Every figure is an aggregate over this publisher's rows. Nothing is computed in the component. */
export async function publisherOverview(userId: string): Promise<PublisherOverview> {
  const today = startOfUtcDay();
  const month = startOfUtcMonth();
  const [earnings] = await query<{
    today: number;
    mtd: number;
    total: number;
    pending: number;
  }>(sql`
    select
      coalesce(sum(case when ${cpaConversion.status} = 'APPROVED' and ${cpaConversion.createdAt} >= ${today} then ${cpaConversion.payout} else 0 end), 0)::float8 as today,
      coalesce(sum(case when ${cpaConversion.status} = 'APPROVED' and ${cpaConversion.createdAt} >= ${month} then ${cpaConversion.payout} else 0 end), 0)::float8 as mtd,
      coalesce(sum(case when ${cpaConversion.status} = 'APPROVED' then ${cpaConversion.payout} else 0 end), 0)::float8 as total,
      coalesce(sum(case when ${cpaConversion.status} = 'PENDING' then ${cpaConversion.payout} else 0 end), 0)::float8 as pending
    from ${cpaConversion}
    where ${cpaConversion.userId} = ${userId}
  `);
  const [clicks] = await query<{ today: number; total: number; conversions: number }>(sql`
    select
      count(*) filter (where ${cpaClick.createdAt} >= ${today})::int as today,
      count(*)::int as total,
      (select count(*)::int from ${cpaConversion} where ${cpaConversion.userId} = ${userId}) as conversions
    from ${cpaClick}
    where ${cpaClick.userId} = ${userId}
  `);
  const [wallet] = await db()
    .select({
      balance: user.balance,
      totalEarned: user.totalEarned,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return {
    todayEarnings: Number(earnings?.today ?? 0),
    mtdEarnings: Number(earnings?.mtd ?? 0),
    totalEarnings: Number(earnings?.total ?? 0),
    todayClicks: Number(clicks?.today ?? 0),
    totalClicks: Number(clicks?.total ?? 0),
    totalConversions: Number(clicks?.conversions ?? 0),
    pendingEarnings: Number(earnings?.pending ?? 0),
    balance: Number(wallet?.balance ?? 0),
    lifetimeCredited: Number(wallet?.totalEarned ?? 0),
  };
}

export type DailyPerformance = {
  date: string;
  clicks: number;
  conversions: number;
  earnings: number;
};

/**
 * Clicks, conversions and approved earnings for each of the last `days` UTC days.
 * Clicks and conversions are grouped by their createdAt day in SQL; generate_series keeps empty
 * days in the result with real zero counts, so the page never has to invent a value.
 */
export async function dailyPerformance(userId: string, days = 7): Promise<DailyPerformance[]> {
  const span = Math.max(1, Math.min(90, Math.trunc(days)));
  const end = startOfUtcDay();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (span - 1));
  const tomorrow = new Date(end);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const rows = await query<{ date: string; clicks: number; conversions: number; earnings: number }>(sql`
    with days as (
      select generate_series(${start}::date, ${end}::date, interval '1 day')::date as day
    ),
    clicks as (
      select (${cpaClick.createdAt} at time zone 'UTC')::date as day,
        count(*)::int as clicks
      from ${cpaClick}
      where ${cpaClick.userId} = ${userId}
        and ${cpaClick.createdAt} >= ${start}
        and ${cpaClick.createdAt} < ${tomorrow}
      group by 1
    ),
    conversions as (
      select (${cpaConversion.createdAt} at time zone 'UTC')::date as day,
        count(*)::int as conversions,
        coalesce(sum(case when ${cpaConversion.status} = 'APPROVED' then ${cpaConversion.payout} else 0 end), 0)::float8
          as earnings
      from ${cpaConversion}
      where ${cpaConversion.userId} = ${userId}
        and ${cpaConversion.createdAt} >= ${start}
        and ${cpaConversion.createdAt} < ${tomorrow}
      group by 1
    )
    select
      to_char(days.day, 'YYYY-MM-DD') as date,
      coalesce(clicks.clicks, 0)::int as clicks,
      coalesce(conversions.conversions, 0)::int as conversions,
      coalesce(conversions.earnings, 0)::float8 as earnings
    from days
    left join clicks on clicks.day = days.day
    left join conversions on conversions.day = days.day
    order by days.day
  `);
  return rows.map((r) => ({
    date: r.date,
    clicks: Number(r.clicks),
    conversions: Number(r.conversions),
    earnings: Number(r.earnings),
  }));
}

export type RecentConversion = {
  id: string;
  createdAt: Date;
  offerName: string;
  payout: number;
  status: string;
  country: string | null;
};

export async function recentConversions(userId: string, limit = 8): Promise<RecentConversion[]> {
  const rows = await db()
    .select({
      id: cpaConversion.id,
      createdAt: cpaConversion.createdAt,
      offerName: cpaOffer.name,
      payout: cpaConversion.payout,
      status: cpaConversion.status,
      country: cpaClick.country,
    })
    .from(cpaConversion)
    .innerJoin(cpaOffer, eq(cpaConversion.offerId, cpaOffer.id))
    .innerJoin(cpaClick, eq(cpaConversion.clickId, cpaClick.id))
    .where(eq(cpaConversion.userId, userId))
    .orderBy(desc(cpaConversion.createdAt))
    .limit(limit);
  return rows;
}

/** The publisher's latest payout requests, for the account page. */
export async function payoutHistory(userId: string, limit = 10) {
  return db()
    .select()
    .from(cpaPayoutRequest)
    .where(eq(cpaPayoutRequest.userId, userId))
    .orderBy(desc(cpaPayoutRequest.createdAt))
    .limit(limit);
}

/** Newest click per offer for this publisher, used by "your links" style tables. */
export async function clicksByOffer(userId: string, limit = 20) {
  return db()
    .select({
      offerId: cpaOffer.id,
      offerName: cpaOffer.name,
      clicks: sql<number>`count(${cpaClick.id})::int`,
      lastClick: sql<Date | null>`max(${cpaClick.createdAt})`,
    })
    .from(cpaClick)
    .innerJoin(cpaOffer, eq(cpaClick.offerId, cpaOffer.id))
    .where(eq(cpaClick.userId, userId))
    .groupBy(cpaOffer.id, cpaOffer.name)
    .orderBy(desc(sql`count(${cpaClick.id})`))
    .limit(limit);
}

/** Advertiser roll-up for the Advertise page: live inventory per advertiser. */
export async function advertiserSummary() {
  return db()
    .select({
      advertiser: cpaOffer.advertiserName,
      offers: sql<number>`count(*)::int`,
      minPayout: sql<number>`min(${cpaOffer.payout})::float8`,
      maxPayout: sql<number>`max(${cpaOffer.payout})::float8`,
    })
    .from(cpaOffer)
    .where(eq(cpaOffer.isActive, true))
    .groupBy(cpaOffer.advertiserName)
    .orderBy(desc(sql`count(*)`), asc(cpaOffer.advertiserName));
}
