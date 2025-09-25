import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username, password }),
      });

      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      toast.success(data.message || "User registered successfully");
      setTimeout(() => navigate("/login"), 1000); // small delay for UX
    } catch (err) {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      {/* Toast container */}
      <Toaster position="top-center" />

      <div className="w-full max-w-sm border rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-center mb-4">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded-lg px-3 py-3 text-base"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-3 text-base"
          />

          <button
            type="submit"
            className="w-full bg-black text-white rounded-lg px-4 py-3 text-base transition hover:opacity-90"
          >
            Register
          </button>
        </form>

        <div className="text-center mt-4">
          <Link
            to="/login"
            className="text-sm text-black/60 hover:text-black underline"
          >
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}
