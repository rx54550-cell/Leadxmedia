"use client";

import { type Icon, ArrowRight, Check, Megaphone, Star, Target } from "@leadxmedia/ui/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  CAPTCHA_ERROR,
  Captcha,
  captchaHeaders,
  isCaptchaError,
  resetCaptcha,
} from "@/components/auth/captcha";
import { authClient } from "@/lib/auth-client";
import { type SignupRole, saveSignupRole } from "./actions";

type SignupSocial = "google" | "facebook";

const ROLES: {
  id: SignupRole;
  icon: Icon;
  title: string;
  description: string;
  features: string[];
}[] = [
  {
    id: "publisher",
    icon: Megaphone,
    title: "I am a Publisher",
    description: "Earn money promoting offers",
    features: ["Access 500+ Offers", "Real-time tracking", "Weekly payouts"],
  },
  {
    id: "advertiser",
    icon: Target,
    title: "I am an Advertiser",
    description: "Grow your business with quality traffic",
    features: ["Launch offers in minutes", "Fraud protection", "Dedicated manager"],
  },
];

const STRENGTH_LABEL = ["Weak", "Good", "Strong"] as const;

function passwordStrength(password: string) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(3, Math.max(1, score));
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-[18px] shrink-0" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function FacebookMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px] shrink-0" aria-hidden>
      <path
        fill="#1877F2"
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.412c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
      />
    </svg>
  );
}

function InstagramMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px] shrink-0" aria-hidden>
      <defs>
        <linearGradient id="ig-signup" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FD5949" />
          <stop offset=".5" stopColor="#D6249F" />
          <stop offset="1" stopColor="#285AEB" />
        </linearGradient>
      </defs>
      <path
        fill="url(#ig-signup)"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
      />
    </svg>
  );
}

function Eye({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 3l18 18" strokeLinecap="round" />
      <path
        d="M10.6 10.7a2 2 0 002.7 2.7M9.9 5.2A10.8 10.8 0 0112 5c5.2 0 9 4.5 9 7 0 .8-.6 1.9-1.7 3M6.6 6.8C4.4 8.2 3 10.2 3 12c0 2.5 3.8 7 9 7 1.4 0 2.7-.3 3.8-.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M3 12s3.8-7 9-7 9 7 9 7-3.8 7-9 7-9-7-9-7z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function SignupForm({
  next,
  email,
  social,
  captcha,
  via,
}: {
  next: string;
  email: string;
  social: SignupSocial[];
  captcha?: string;
  via?: string;
}) {
  const router = useRouter();
  const [role, setRole] = useState<SignupRole>("publisher");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialBusy, setSocialBusy] = useState<string | null>(null);

  const roleHome = role === "advertiser" ? "/advertiser/dashboard" : "/dashboard";
  const explicitNext = next && next !== "/onboarding" ? next : "";
  const strength = passwordStrength(password);

  async function onSocial(provider: SignupSocial, label: string) {
    if (!social.includes(provider)) {
      toast.error(`${label} sign-in isn't configured yet. Create your account with email below.`);
      return;
    }
    setSocialBusy(label);
    if (via) {
      window.location.assign(`${via}/login?next=${encodeURIComponent(explicitNext || roleHome)}`);
      return;
    }
    const res = await authClient.signIn.social({
      provider,
      callbackURL: explicitNext || roleHome,
      newUserCallbackURL: explicitNext || roleHome,
      errorCallbackURL: "/signup",
    });
    if (res.error) {
      setSocialBusy(null);
      toast.error(res.error.message ?? `${label} sign-in could not start. Try email instead.`);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const f = new FormData(form);
    const first = String(f.get("firstName") ?? "").trim();
    const lastName = String(f.get("lastName") ?? "").trim();
    const name = [first, lastName].filter(Boolean).join(" ");
    if (!f.get("terms")) {
      setError("Please agree to the Terms and Privacy Policy to create your account.");
      return;
    }
    setLoading(true);
    const res = await authClient.signUp.email({
      name,
      email: String(f.get("email")),
      password: String(f.get("password")),
      fetchOptions: await captchaHeaders(form, captcha),
    });
    if (res.error) {
      setLoading(false);
      resetCaptcha();
      return setError(
        isCaptchaError(res.error.code)
          ? CAPTCHA_ERROR
          : (res.error.message ?? "Could not create the account"),
      );
    }

    const saved = await saveSignupRole(role).catch(() => ({
      ok: false as const,
      error: "Could not save your role.",
    }));
    if (!saved.ok) {
      toast.error("Your account was created, but we couldn't save your role. You can choose it again later.");
    }
    setLoading(false);
    router.push(explicitNext || (saved.ok ? roleHome : "/dashboard"));
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-white text-[#0F172A] lg:grid lg:h-dvh lg:grid-cols-[45%_55%] lg:overflow-hidden">
      <aside className="relative isolate overflow-hidden bg-[#0A0A1B] px-6 py-8 text-white sm:px-10 lg:flex lg:h-dvh lg:flex-col lg:px-12 lg:py-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-24 size-[26rem] rounded-full bg-[#7C3AED]/35 blur-[110px]" />
          <div className="absolute top-1/3 -right-28 size-[24rem] rounded-full bg-[#2563EB]/30 blur-[110px]" />
          <div className="absolute bottom-0 left-1/4 size-[20rem] rounded-full bg-[#A855F7]/20 blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,27,0)_0%,rgba(10,10,27,0.35)_100%)]" />
        </div>

        <div className="relative z-10 flex h-full flex-col">
          <Link href="/" className="inline-flex w-fit items-center gap-2.5" aria-label="LeadXMedia home">
            <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-[11px] font-bold tracking-[-0.06em] text-white ring-1 ring-white/20">
              LX
            </span>
            <span className="text-[18px] font-semibold tracking-[-0.03em] text-white">
              LeadX<span className="font-normal text-white/65">Media</span>
            </span>
          </Link>

          <div className="flex flex-1 flex-col justify-center py-10 lg:py-12">
            <h1 className="max-w-[430px] text-[34px] leading-[1.08] font-semibold tracking-[-0.045em] text-white sm:text-[40px]">
              Grow With LeadXMedia
            </h1>
            <p className="mt-4 max-w-[430px] text-[14px] leading-6 text-white/65">
              Join 10,000+ publishers and advertisers earning with the #1 performance network. Fast
              payouts, real-time tracking, and dedicated support.
            </p>

            <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
              {[
                ["500+", "Active Publishers"],
                ["120M", "Monthly Conversions"],
                ["97%", "On-time Payouts"],
              ].map(([value, label]) => (
                <div key={label} className="flex flex-col-reverse gap-0.5">
                  <dt className="text-[10px] leading-4 font-medium tracking-[0.04em] text-white/45 uppercase">
                    {label}
                  </dt>
                  <dd className="text-[20px] leading-7 font-semibold tracking-[-0.03em] text-white">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
            <div className="flex gap-0.5 text-[#FBBF24]" aria-label="5 out of 5 stars">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={13} weight="fill" aria-hidden />
              ))}
            </div>
            <blockquote className="mt-3 text-[13px] leading-6 text-white/80">
              “LeadXMedia changed how we scale. Payouts are always on time and support is world-class.”
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#2563EB] text-[11px] font-semibold text-white">
                AR
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-white">Alex Rivera</p>
                <p className="truncate text-[11px] text-white/45">Growth Lead at Nova Labs</p>
              </div>
            </figcaption>
          </figure>
        </div>
      </aside>

      <main className="min-w-0 bg-white px-5 py-8 sm:px-8 lg:h-dvh lg:overflow-y-auto lg:px-12 lg:py-8">
        <div className="mx-auto w-full max-w-[560px]">
          <div className="flex items-center justify-end gap-1 text-[12px] text-[#64748B]">
            <span>Already have an account?</span>
            <Link href="/login" className="font-semibold text-[#7C3AED] hover:underline">
              Sign in
            </Link>
          </div>

          <div className="mt-8">
            <h2 className="text-[30px] leading-[1.1] font-semibold tracking-[-0.04em] text-[#0A0A1B] sm:text-[34px]">
              Join LeadXMedia
            </h2>
            <p className="mt-2 text-[14px] text-[#64748B]">Choose your path to get started</p>
          </div>

          <div className="mt-7 grid gap-3" role="radiogroup" aria-label="Choose your role">
            {ROLES.map((option) => {
              const selected = role === option.id;
              const RoleIcon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setRole(option.id)}
                  className={`group flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                    selected
                      ? "border-[#7C3AED] bg-[#F5F3FF] shadow-[0_0_0_3px_rgba(124,58,237,0.08)]"
                      : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                      selected ? "bg-[#7C3AED] text-white" : "bg-[#F1F5F9] text-[#64748B]"
                    }`}
                  >
                    <RoleIcon size={19} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-[14px] leading-5 font-semibold text-[#0F172A]">
                        {option.title}
                      </span>
                      <span
                        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${
                          selected
                            ? "border-[#7C3AED] bg-[#7C3AED] text-white"
                            : "border-[#CBD5E1] bg-white text-transparent"
                        }`}
                        aria-hidden
                      >
                        <Check size={12} weight="bold" />
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-5 text-[#64748B]">
                      {option.description}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                      {option.features.map((feature) => (
                        <span
                          key={feature}
                          className="inline-flex items-center gap-1.5 text-[11px] leading-4 text-[#475569]"
                        >
                          <span className="size-1 rounded-full bg-[#7C3AED]" aria-hidden />
                          {feature}
                        </span>
                      ))}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2.5">
            {[
              { provider: "google" as const, label: "Google", mark: <GoogleMark /> },
              { provider: "facebook" as const, label: "Facebook", mark: <FacebookMark /> },
              { provider: "facebook" as const, label: "Instagram", mark: <InstagramMark /> },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => onSocial(item.provider, item.label)}
                disabled={socialBusy !== null}
                className="flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-2 text-[12px] font-semibold text-[#0F172A] transition hover:border-[#CBD5E1] hover:bg-[#F8FAFC] disabled:pointer-events-none disabled:opacity-60"
              >
                {socialBusy === item.label ? (
                  <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-[#CBD5E1] border-t-[#0A0A1B]" />
                ) : (
                  item.mark
                )}
                <span className="truncate">
                  <span className="hidden lg:inline">Continue with </span>
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div className="my-6 flex items-center gap-3 text-[11px] font-medium text-[#94A3B8]">
            <span className="h-px flex-1 bg-[#E2E8F0]" />
            OR continue with email
            <span className="h-px flex-1 bg-[#E2E8F0]" />
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex min-w-0 flex-col gap-1.5">
                <span className="text-[12px] font-semibold text-[#334155]">First Name</span>
                <input
                  name="firstName"
                  autoComplete="given-name"
                  required
                  className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 focus:outline-none"
                  placeholder="Alex"
                />
              </label>
              <label className="flex min-w-0 flex-col gap-1.5">
                <span className="text-[12px] font-semibold text-[#334155]">Last Name</span>
                <input
                  name="lastName"
                  autoComplete="family-name"
                  required
                  className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 focus:outline-none"
                  placeholder="Rivera"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[#334155]">Work email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={email}
                required
                className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 focus:outline-none"
                placeholder="you@company.com"
              />
            </label>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="signup-password" className="text-[12px] font-semibold text-[#334155]">
                  Password
                </label>
                <div className="flex items-center gap-2">
                  <span className="flex gap-1" aria-hidden>
                    {[1, 2, 3].map((dot) => (
                      <span
                        key={dot}
                        className={`h-1.5 w-4 rounded-full transition-colors ${
                          dot <= strength
                            ? strength === 1
                              ? "bg-[#EF4444]"
                              : strength === 2
                                ? "bg-[#F59E0B]"
                                : "bg-[#10B981]"
                            : "bg-[#E2E8F0]"
                        }`}
                      />
                    ))}
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      strength === 1
                        ? "text-[#EF4444]"
                        : strength === 2
                          ? "text-[#F59E0B]"
                          : strength === 3
                            ? "text-[#10B981]"
                            : "text-[#94A3B8]"
                    }`}
                  >
                    {password ? STRENGTH_LABEL[strength - 1] : "8+ characters"}
                  </span>
                </div>
              </div>
              <div className="relative">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 pr-11 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/10 focus:outline-none"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-[#64748B] hover:text-[#0F172A]"
                >
                  <Eye open={showPassword} />
                </button>
              </div>
            </div>

            <Captcha siteKey={captcha} />

            <label className="flex items-start gap-2.5 text-[12px] leading-5 text-[#64748B]">
              <input
                type="checkbox"
                name="terms"
                required
                className="mt-0.5 size-4 shrink-0 rounded border-[#CBD5E1] accent-[#7C3AED]"
              />
              <span>
                I agree to{" "}
                <Link href="/terms" className="font-semibold text-[#7C3AED] hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-semibold text-[#7C3AED] hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {error ? (
              <p
                role="alert"
                className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-[12px] leading-5 text-[#B91C1C]"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0A0A1B] px-5 text-[14px] font-semibold text-white transition hover:bg-[#171735] focus:ring-4 focus:ring-[#0A0A1B]/15 focus:outline-none disabled:pointer-events-none disabled:opacity-60"
            >
              {loading ? (
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} aria-hidden />
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] text-[#94A3B8]">
            Secure with SSL <span className="mx-1.5">•</span> No spam, ever
          </p>
        </div>
      </main>
    </div>
  );
}
