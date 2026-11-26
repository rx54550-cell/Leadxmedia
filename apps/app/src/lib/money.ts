const ZERO_DECIMAL = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

/** Stripe stores these in thousandths (1.000 BHD = 1000). */
const THREE_DECIMAL = new Set(["bhd", "jod", "kwd", "omr", "tnd"]);

export const minorFactor = (currency: string) => {
  const c = currency.toLowerCase();
  return ZERO_DECIMAL.has(c) ? 1 : THREE_DECIMAL.has(c) ? 1000 : 100;
};

/** Minor units to a plain decimal string in major units: 1050 USD -> "10.50", 1050 JPY -> "1050". */
export const toMajor = (minor: number, currency: string) => {
  const f = minorFactor(currency);
  return (minor / f).toFixed(f === 1 ? 0 : f === 1000 ? 3 : 2);
};

export function formatMoney(
  minor: number,
  currency = "usd",
  opts: { compact?: boolean; whole?: boolean } = {},
): string {
  const major = minor / minorFactor(currency);
  // KPI tiles: drop cents once the amount is in the thousands
  const noCents = opts.whole && Math.abs(major) >= 1000;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    notation: opts.compact ? "compact" : "standard",
    minimumFractionDigits: noCents || opts.compact || minorFactor(currency) === 1 ? 0 : undefined,
    maximumFractionDigits: opts.compact ? 1 : noCents || minorFactor(currency) === 1 ? 0 : undefined,
  }).format(major);
}

export const formatNumber = (n: number, compact = false) =>
  new Intl.NumberFormat("en-US", {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(n);

export const formatPercent = (ratio: number, digits = 1) =>
  `${(Number.isFinite(ratio) ? ratio * 100 : 0).toFixed(digits)}%`;

/** Parse "49.99" → 4999 (minor units). */
/** A percent typed by a founder ("12.5") to basis points (1250). Over 100% would pay more than the sale. */
export function percentBp(value: string | number): number {
  const n = Number(value);
  if (!(n >= 0 && n <= 100)) throw new Error("A percent rate can be at most 100.");
  return Math.round(n * 100);
}

export function toMinor(major: string | number, currency = "usd"): number {
  return Math.round(Number(major) * minorFactor(currency));
}
