// src/pages/JobListPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

interface Job {
  id: number;
  service: string;
  customerName: string;
  jobDate: string;
  price: number;
  notes: string;
  address: string;
  paid: boolean;
  invoiceNumber?: string;
}

function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export default function JobListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<null | { type: "delete" | "paid"; job: Job }>(null);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/api/jobs", {
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

  useEffect(() => {
    fetchJobs();
  }, []);

  const markAsPaid = async (jobId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/jobs/${jobId}/mark-paid`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to mark job as paid");
      toast.success("Job marked as paid");
      fetchJobs();
    } catch (err) {
      console.error(err);
      toast.error("Error updating job");
    }
  };

  const deleteJob = async (jobId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete job");
      toast.success("Job deleted");
      fetchJobs();
    } catch (err) {
      console.error(err);
      toast.error("Error deleting job");
    }
  };

  if (loading) return <p className="p-6 text-gray-600">Loading jobs...</p>;

  if (jobs.length === 0) {
    return (
<div className="min-h-[100dvh] bg-gray-50 flex flex-col items-center justify-center p-8">
  {/* Back Button */}
  <button
    onClick={() => navigate("/dashboard")}
    className="absolute top-8 left-8 text-sm text-gray-600 hover:text-black transition"
  >
    ← Back to Dashboard
  </button>

  {/* Empty State */}
  <div className="text-center space-y-6">
    <h1 className="text-2xl font-bold text-gray-900">Job List</h1>
    <p className="text-gray-600 text-base">No jobs found.</p>
    <button
      onClick={() => navigate("/jobs/new")}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-base shadow hover:bg-blue-700 active:scale-95 transition"
    >
      + Create New Job
    </button>
  </div>
</div>


    );
  }

  const today = new Date();

  const todayJobs = jobs.filter((j) => isSameDay(new Date(j.jobDate), today) && !j.paid);
  const upcoming = jobs.filter((j) => new Date(j.jobDate) > today && !j.paid);
  const unpaid = jobs.filter((j) => new Date(j.jobDate) < today && !j.paid);
  const paid = jobs.filter((j) => j.paid);

  return (
    <div className="min-h-[100dvh] bg-gray-50 p-6 max-w-4xl mx-auto space-y-10">
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Job Dashboard</h1>
        <button
          onClick={() => navigate("/jobs/new")}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium shadow-md hover:scale-105 hover:shadow-lg transition transform duration-200 border border-blue-400/30"
        >
          + New Job
        </button>
      </header>

      <JobSection
        title="Today"
        color="blue"
        jobs={todayJobs}
        onMarkAsPaid={(job) => setConfirmAction({ type: "paid", job })}
        onDelete={(job) => setConfirmAction({ type: "delete", job })}
      />
      <JobSection
        title="Upcoming"
        color="blue"
        jobs={upcoming}
        onMarkAsPaid={(job) => setConfirmAction({ type: "paid", job })}
        onDelete={(job) => setConfirmAction({ type: "delete", job })}
      />
      <JobSection
        title="Unpaid (Past)"
        color="red"
        jobs={unpaid}
        onMarkAsPaid={(job) => setConfirmAction({ type: "paid", job })}
        onDelete={(job) => setConfirmAction({ type: "delete", job })}
      />
      <JobSection
        title="Paid"
        color="green"
        jobs={paid}
        onMarkAsPaid={(job) => setConfirmAction({ type: "paid", job })}
        onDelete={(job) => setConfirmAction({ type: "delete", job })}
      />

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {confirmAction.type === "delete" ? "Delete Job" : "Mark Job as Paid"}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to{" "}
              {confirmAction.type === "delete" ? "delete" : "mark as paid"} this job for{" "}
              <span className="font-medium">{confirmAction.job.customerName}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (confirmAction.type === "delete") {
                    await deleteJob(confirmAction.job.id);
                  } else {
                    await markAsPaid(confirmAction.job.id);
                  }
                  setConfirmAction(null);
                }}
                className={`px-4 py-2 rounded-lg text-white font-medium shadow ${confirmAction.type === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
                  } transition`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function JobSection({
  title,
  jobs,
  onMarkAsPaid,
  onDelete,
  color,
}: {
  title: string;
  jobs: Job[];
  onMarkAsPaid: (job: Job) => void;
  onDelete: (job: Job) => void;
  color: "blue" | "red" | "green";
}) {
  const navigate = useNavigate();

  if (jobs.length === 0) return null;

  const borderClasses: Record<string, string> = {
    blue: "border-l-4 border-blue-500",
    red: "border-l-4 border-red-500",
    green: "border-l-4 border-green-500",
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <span className="text-sm text-gray-500">{jobs.length} jobs</span>
      </div>
      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`bg-white rounded-xl shadow p-4 border border-gray-200 hover:shadow-md transition ${borderClasses[color]}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-lg">{job.customerName}</p>
                <p className="text-sm text-gray-600">{job.service}</p>
                <p className="text-sm text-gray-600">
                  {new Date(job.jobDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">${job.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600">{job.address}</p>
                {job.notes && (
                  <p className="text-sm text-gray-500 italic mt-1">
                    Notes: {job.notes}
                  </p>
                )}
              </div>
              <div className="ml-4 flex flex-col gap-2">
                {job.paid ? (
                  <span className="w-32 text-center px-3 py-1 text-xs font-medium rounded bg-green-100 text-green-700 ml-auto">
                    Paid
                  </span>
                ) : (
                  <button
                    onClick={() => onMarkAsPaid(job)}
                    className="w-32 text-center px-4 py-1 text-sm rounded-full bg-green-100 text-green-700 font-medium hover:bg-green-200 transition ml-auto"
                  >
                    Mark as Paid
                  </button>
                )}

                <button
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="w-32 text-center px-4 py-1 text-sm rounded-full bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition ml-auto"
                >
                  Edit
                </button>

                <button
                  onClick={() => onDelete(job)}
                  className="w-32 text-center px-4 py-1 text-sm rounded-full bg-red-100 text-red-700 font-medium hover:bg-red-200 transition ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
