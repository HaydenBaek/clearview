// src/pages/MainPage.tsx
import React from "react";

/**
 * MainPage
 * Owner-facing dashboard (mobile first).
 * Shows quick KPIs + upcoming jobs.
 * Replace the demo data with your /api/dashboard/summary later.
 */

type Job = {
  id: number;
  scheduledAt: string; // ISO timestamp
  customer: string;
  address: string;
  status: "scheduled" | "in_progress" | "completed" | "paid";
  priceCents: number;
};

// --- Temporary demo data (keeps the UI from looking empty during setup)
const UPCOMING_COUNT = 4;
const UNPAID_TOTAL_CENTS = 48_500;
const SAMPLE_JOBS: Job[] = [
  {
    id: 1,
    scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    customer: "Greenwood Residence",
    address: "1234 Maple St, Vancouver, BC",
    status: "scheduled",
    priceCents: 12_000,
  },
  {
    id: 2,
    scheduledAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    customer: "Harper Dental Clinic",
    address: "88 W 8th Ave, Vancouver, BC",
    status: "scheduled",
    priceCents: 18_000,
  },
  {
    id: 3,
    scheduledAt: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    customer: "Riverview Apartments",
    address: "512 River Rd, Burnaby, BC",
    status: "scheduled",
    priceCents: 9_500,
  },
];

// --- Lightweight helpers (keep these tiny; swap out later if you add i18n/currency libs)
const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const whenFmt = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

// status -> badge styles (Tailwind classes). Fixed keys so JIT never misses them.
const statusClasses: Record<Job["status"], string> = {
  scheduled: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-700",
  paid: "bg-emerald-100 text-emerald-700",
};

function niceStatus(s: Job["status"]) {
  // Turn "in_progress" into "In Progress"
  return s.replace("_", " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function jobsToday(rows: Job[]) {
  // Simple “same calendar day” check; good enough for scheduling UI
  const t = new Date();
  return rows.filter((j) => {
    const d = new Date(j.scheduledAt);
    return (
      d.getFullYear() === t.getFullYear() &&
      d.getMonth() === t.getMonth() &&
      d.getDate() === t.getDate()
    );
  }).length;
}

export default function MainPage() {
  return (
    <div className="min-h-[100dvh] bg-white">
      {/* Top bar: brand + quick links. Keep this simple; we can upgrade to a full nav later. */}
      <header className="border-b">
        <div className="mx-auto max-w-6xl h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Tiny logo placeholder */}
            <div className="h-8 w-8 rounded-xl bg-black text-white grid place-items-center font-bold">
              CV
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight">ClearView</h1>
              <span className="text-black/50 text-sm">Owner Dashboard</span>
            </div>
          </div>

          {/* Anchors for now. If/when you add React Router, swap to <Link>. */}
          <nav className="flex items-center gap-2">
            <a
              href="/map"
              className="rounded-lg px-3 py-2 text-sm border hover:shadow-sm transition"
            >
              Open Map
            </a>
            <a
              href="/jobs"
              className="rounded-lg px-3 py-2 text-sm border hover:shadow-sm transition"
            >
              View Jobs
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* KPIs — mobile first grid; scales up nicely on bigger screens */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Upcoming Jobs" value={UPCOMING_COUNT} />
          <KpiCard label="Unpaid Total" value={formatMoney(UNPAID_TOTAL_CENTS)} />
          <KpiCard label="Jobs Today" value={jobsToday(SAMPLE_JOBS)} />
          <KpiCard label="MTD Revenue" value={"$12,345.00"} />
        </section>

        {/* Quick actions — low effort, high impact shortcuts */}
        <section className="flex flex-wrap gap-3">
          {/* Shimmer is just a tiny keyframe for a subtle premium feel */}
          <a
            href="/jobs?new=1"
            className="rounded-xl px-3 py-2 text-sm text-white transition hover:shadow-sm"
            style={{
              background: "linear-gradient(110deg,#111 40%,#333 45%,#111 50%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2.5s ease-in-out infinite",
            }}
          >
            Add Job
          </a>
          <a
            href="/customers?new=1"
            className="rounded-lg px-3 py-2 text-sm border hover:shadow-sm transition"
          >
            Add Customer
          </a>
          <a
            href="/invoices"
            className="rounded-lg px-3 py-2 text-sm border hover:shadow-sm transition"
          >
            Invoices
          </a>
          <style>
            {`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}
          </style>
        </section>

        {/* Upcoming jobs:
            - Cards on mobile (easy to scan with thumbs)
            - Table on md+ (dense view for desktop) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Next Jobs</h2>
            <a href="/jobs" className="text-sm text-black/60 hover:text-black">
              See all
            </a>
          </div>

          {/* Mobile view: cards */}
          <div className="grid gap-3 md:hidden">
            {SAMPLE_JOBS.map((j) => (
              <article
                key={j.id}
                className="rounded-xl border p-3 shadow-[0_1px_0_0_rgba(0,0,0,0.02)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{j.customer}</div>
                    <div className="text-xs text-black/60">
                      {whenFmt.format(new Date(j.scheduledAt))}
                    </div>
                    <div className="text-xs text-black/60 truncate">{j.address}</div>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses[j.status]}`}
                  >
                    {niceStatus(j.status)}
                  </span>
                </div>

                <div className="mt-2 text-right text-sm font-medium">
                  {formatMoney(j.priceCents)}
                </div>
              </article>
            ))}
          </div>

          {/* Desktop view: table */}
          <div className="hidden md:block border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <ThLeft>When</ThLeft>
                    <ThLeft>Customer</ThLeft>
                    <ThLeft>Address</ThLeft>
                    <ThLeft>Status</ThLeft>
                    <ThRight>Price</ThRight>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_JOBS.map((j) => (
                    <tr key={j.id} className="border-t hover:bg-gray-50/60">
                      <TdLeft>{whenFmt.format(new Date(j.scheduledAt))}</TdLeft>
                      <TdLeft>{j.customer}</TdLeft>
                      <TdLeft className="max-w-[360px] truncate">{j.address}</TdLeft>
                      <TdLeft>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses[j.status]}`}
                        >
                          {niceStatus(j.status)}
                        </span>
                      </TdLeft>
                      <TdRight>{formatMoney(j.priceCents)}</TdRight>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* === Small, readable UI bits ===
   Keep these tiny and boring. If they grow, move them into /components. */

function KpiCard(props: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 transition hover:shadow-sm hover:-translate-y-0.5">
      <div className="text-xs uppercase tracking-wide text-black/50">
        {props.label}
      </div>
      <div className="text-3xl font-semibold mt-1">{props.value}</div>
    </div>
  );
}

function ThLeft({ children }: { children: React.ReactNode }) {
  return <th className="p-2 text-left font-medium text-black/70">{children}</th>;
}
function ThRight({ children }: { children: React.ReactNode }) {
  return <th className="p-2 text-right font-medium text-black/70">{children}</th>;
}
function TdLeft({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`p-2 text-left align-middle ${className}`}>{children}</td>;
}
function TdRight({ children }: { children: React.ReactNode }) {
  return <td className="p-2 text-right align-middle">{children}</td>;
}
