// src/components/JobCard.tsx
import { useNavigate } from "react-router-dom";
import type { Job } from "../types";

type JobCardProps = {
  job: Job;
  onMarkPaid?: (id: number) => void;
  onDelete?: (id: number) => void;
};

export default function JobCard({ job, onMarkPaid, onDelete }: JobCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow p-4 border border-gray-200 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        {/* Job Info */}
        <div>
          <p className="font-semibold text-lg">{job.customerName}</p>
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

        {/* Actions */}
        <div className="flex flex-col gap-2 ml-4">
          {!job.paid && onMarkPaid && (
            <button
              onClick={() => onMarkPaid(job.id)}
              className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition"
            >
              Mark as Paid
            </button>
          )}

          <button
            onClick={() => navigate(`/jobs/${job.id}`)}
            className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition"
          >
            Edit
          </button>

          {onDelete && (
            <button
              onClick={() => onDelete(job.id)}
              className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
