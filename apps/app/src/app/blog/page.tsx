import { ArrowRight, BookOpen, Clock } from "@leadxmedia/ui/icons";
import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFooter, MarketingNav } from "@/components/marketing/chrome";

export const metadata: Metadata = {
  title: "Blog",
  description: "Playbooks, offer breakdowns and payout benchmarks for affiliate publishers and advertisers.",
};

const POSTS = [
  {
    tag: "Publishers",
    title: "How to pick your first CPA offer (and avoid the traps)",
    excerpt:
      "Vertical, payout, EPC and approval time — the four numbers that decide whether an offer is worth your traffic.",
    read: "6 min read",
  },
  {
    tag: "Traffic",
    title: "The 24-hour payout playbook: cash flow for affiliates",
    excerpt:
      "How top publishers reinvest daily payouts into paid traffic without ever running out of working capital.",
    read: "8 min read",
  },
  {
    tag: "Advertisers",
    title: "Fraud screening that doesn’t kill good volume",
    excerpt:
      "A practical look at the signals we check before a conversion is approved, and how to tune them for your offer.",
    read: "5 min read",
  },
];

export default function BlogPage() {
  return (
    <div className="marketing min-h-dvh bg-white text-[#0F172A]">
      <MarketingNav />

      <main>
        <section className="mx-auto max-w-[1200px] px-5 pt-16 pb-12 sm:px-8 lg:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-1.5 text-[12px] font-semibold text-[#1D4ED8]">
            <BookOpen size={13} />
            The LeadXMedia blog
          </span>
          <h1 className="mt-6 max-w-[24ch] text-[40px] leading-[1.06] font-semibold tracking-[-0.045em] text-[#0F172A] sm:text-[52px]">
            Playbooks for people who earn online
          </h1>
          <p className="mt-5 max-w-[60ch] text-[16px] leading-7 text-[#64748B]">
            Offer breakdowns, traffic tactics and payout benchmarks — written by the team that reviews every
            campaign on the network.
          </p>
        </section>

        <section className="mx-auto max-w-[1200px] px-5 pb-20 sm:px-8 lg:pb-24">
          <div className="grid gap-5 md:grid-cols-3">
            {POSTS.map((post) => (
              <article
                key={post.title}
                className="flex flex-col rounded-2xl border border-[#E2E8F0] bg-white p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#1D4ED8]">
                    {post.tag}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#94A3B8]">
                    <Clock size={12} />
                    {post.read}
                  </span>
                </div>
                <h2 className="mt-4 text-[17px] leading-6 font-semibold tracking-[-0.01em] text-[#0F172A]">
                  {post.title}
                </h2>
                <p className="mt-2 flex-1 text-[13.5px] leading-6 text-[#64748B]">{post.excerpt}</p>
                <p className="mt-5 border-t border-[#F1F5F9] pt-4 text-[12px] font-medium text-[#94A3B8]">
                  Publishing soon
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="text-[15px] font-semibold text-[#0F172A]">Want the next post in your inbox?</p>
              <p className="mt-1 text-[13px] text-[#64748B]">
                Create a free account and we’ll send new playbooks as they land.
              </p>
            </div>
            <Link
              href="/signup"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 text-[13px] font-semibold text-white hover:bg-[#1D4ED8]"
            >
              Join free
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
