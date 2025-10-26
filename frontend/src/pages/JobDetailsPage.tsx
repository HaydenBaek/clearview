// src/pages/JobDetailsPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Job {
  id: number;
  service: string | null;
  customerName: string | null;
  jobDate: string | null;
  price: number | null;
  notes: string | null;
  address: string | null;
}

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`http://localhost:8080/api/jobs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch job");
        return res.json();
      })
      .then((data) => {
        setJob(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load job details");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!job) return;
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!job) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(job),
      });

      if (!res.ok) throw new Error("Failed to update job");

      toast.success("Job updated successfully");
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error("Error saving job");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-gray-600">Loading job details...</p>;
  }

  if (!job) {
    return <p className="p-6 text-red-500">Job not found</p>;
  }

  return (
    <div className="min-h-[100dvh] bg-gray-100 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-gray-900">Edit Job</h1>
        <div className="w-10" />
      </header>

      {/* Edit Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-5 border border-gray-200">
        <div>
          <label className="block text-base font-medium text-gray-800 mb-1">
            Customer Name
          </label>
          <input
            name="customerName"
            value={job.customerName ?? ""}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-800 mb-1">
            Service
          </label>
          <input
            name="service"
            value={job.service ?? ""}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-800 mb-1">
            Job Date
          </label>
          <input
            type="date"
            name="jobDate"
            value={job.jobDate ? job.jobDate.split("T")[0] : ""}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-800 mb-1">
            Price ($)
          </label>
          <input
            type="number"
            step="0.01"
            name="price"
            value={job.price ?? ""}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-800 mb-1">
            Address
          </label>
          <input
            name="address"
            value={job.address ?? ""}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-800 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={job.notes ?? ""}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-y"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
