import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Logo */}
        <div className="h-12 w-12 mx-auto rounded-xl bg-black text-white grid place-items-center font-bold text-lg">
          CV
        </div>

        <h1 className="text-2xl font-semibold">Welcome to ClearView</h1>
        <p className="text-black/60">
          Manage your jobs, customers, and invoices all in one place.
        </p>

        <div className="flex flex-col gap-3 mt-6">
          <Link
            to="/login"
            className="w-full bg-black text-white rounded-lg px-4 py-2 transition hover:opacity-90"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="w-full border rounded-lg px-4 py-2 hover:shadow-sm transition"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
