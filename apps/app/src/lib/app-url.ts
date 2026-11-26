/**
 * Public URL of the app. Vercel/Better Auth deployments set BETTER_AUTH_URL, so prefer it when
 * available; APP_URL remains the fallback and local development uses localhost. No trailing slash.
 */
export const appUrl = () =>
  (process.env.BETTER_AUTH_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");
