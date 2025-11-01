import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type RevenueData = {
  month: string;
  paid: number;
  unpaid: number;
};

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs/revenue`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error("Failed to fetch revenue data");
        setData(await res.json());
      } catch (err) {
        console.error("Error fetching revenue", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600 animate-pulse">Loading revenue...</p>
      </div>
    );
  }

  const totalPaid = data.reduce((sum, d) => sum + d.paid, 0);
  const totalUnpaid = data.reduce((sum, d) => sum + d.unpaid, 0);
  const totalRevenue = totalPaid + totalUnpaid;

  return (
    <div className="min-h-[100dvh] bg-gray-50 p-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-gray-600 hover:text-black transition"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h1>
        <span className="text-xs text-gray-500">
          {new Date().toLocaleDateString()}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KpiCard label="Paid" value={`$${totalPaid.toFixed(2)}`} color="text-green-600" />
        <KpiCard label="Unpaid" value={`$${totalUnpaid.toFixed(2)}`} color="text-red-600" />
        <KpiCard label="Total" value={`$${totalRevenue.toFixed(2)}`} color="text-blue-600" />
      </div>

      {/* Monthly Breakdown */}
      {/* Monthly Breakdown */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Breakdown</h2>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="font-semibold text-gray-900 mb-3">{item.month}</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-gray-500 text-xs mb-1">Paid</div>
                  <div className="text-green-600 font-medium">${item.paid.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Unpaid</div>
                  <div className="text-red-600 font-medium">${item.unpaid.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs mb-1">Total</div>
                  <div className="text-blue-600 font-medium">
                    ${(item.paid + item.unpaid).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="p-6 rounded-xl bg-white shadow border border-gray-100 hover:shadow-md transition">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
