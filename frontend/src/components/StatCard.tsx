import React from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
};

export default function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
      <div className="text-2xl font-semibold text-gray-900 mt-1">{value}</div>
    </div>
  );
}

