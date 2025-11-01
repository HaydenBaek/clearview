// src/pages/MainPage.tsx
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import QuickAction from "../components/QuickAction";
import JobCard from "../components/JobCard";
import type { Job } from "../types";

type MainPageProps = {
  onLogout: () => void;
};

const formatMoney = (amount: number) => `$${(amount || 0).toFixed(2)}`;

export default function MainPage({ onLogout }: MainPageProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // === Derived Data ===
  const { upcoming, jobsToday, unpaid, unpaidTotal, paidTotal } = useMemo(() => {
    const now = new Date();

    const upcoming = jobs.filter((j) => new Date(j.jobDate) > now && !j.paid);
    const unpaid = jobs.filter((j) => new Date(j.jobDate) <= now && !j.paid);
    const paid = jobs.filter((j) => j.paid);

    const jobsToday = jobs.filter((j) => {
      const d = new Date(j.jobDate);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    });

    return {
      upcoming,
      jobsToday,
      unpaid,
      unpaidTotal: unpaid.reduce((sum, j) => sum + (j.price || 0), 0),
      paidTotal: paid.reduce((sum, j) => sum + (j.price || 0), 0),
    };
  }, [jobs]);

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <p className="text-gray-600">Loading jobs…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">

      <Navbar onLogout={onLogout} />

      <main className="flex-1 mx-auto max-w-6xl px-6 py-8 space-y-12">
        {/* KPI Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Upcoming" value={upcoming.length} />
          <StatCard label="Unpaid Total" value={formatMoney(unpaidTotal)} />
          <StatCard label="Jobs Today" value={jobsToday.length} />
          <StatCard label="Revenue (Paid)" value={formatMoney(paidTotal)} />
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <QuickAction to="/jobs/new" label="Add Job" />
            <QuickAction to="/jobs" label="View Jobs" />
            <QuickAction to="/customers/new" label="Add Customer" />
          </div>
        </section>

        {/* Jobs Today */}
        <DashboardSection
          title="Jobs Today"
          jobs={jobsToday}
          emptyText="No jobs today"
        />

        {/* Upcoming Jobs */}
        <DashboardSection
          title="Upcoming Jobs"
          jobs={upcoming}
          emptyText="No upcoming jobs"
        />

        {/* Unpaid Jobs */}
        <DashboardSection
          title="Unpaid Jobs"
          jobs={unpaid}
          emptyText="No unpaid jobs"
        />
      </main>
    </div>
  );
}

// === Reusable Section Component ===
function DashboardSection({
  title,
  jobs,
  emptyText,
}: {
  title: string;
  jobs: Job[];
  emptyText: string;
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <Link
          to="/jobs"
          className="text-sm text-blue-600 hover:underline font-medium"
        >
          View All
        </Link>
      </div>
      {jobs.length === 0 ? (
        <p className="text-gray-500 text-sm">{emptyText}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.slice(0, 3).map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}
