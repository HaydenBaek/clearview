import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const url = `${import.meta.env.VITE_API_URL}/api/auth/login`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username, password }),
      });

      const text = await res.text();
      let token: string | null = null;

      try {
        const data = JSON.parse(text);
        token = data.token; // if backend sends { "token": "..." }
      } catch {
        token = text; // if backend sends plain token
      }

      if (!res.ok || !token) {
        toast.error("Invalid username or password");
        return;
      }

      localStorage.setItem("token", token);
      toast.success("Login successful");

      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      {/* Toast container */}
      <Toaster position="top-center" />

      <div className="w-full max-w-sm border rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-center mb-4">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-1 focus:ring-black"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-1 focus:ring-black"
          />

          <button
            type="submit"
            className="w-full bg-black text-white rounded-lg px-4 py-3 text-base transition hover:opacity-90"
          >
            Login
          </button>
        </form>

        <div className="text-center mt-4">
          <Link
            to="/register"
            className="text-sm text-black/60 hover:text-black underline"
          >
            Need an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
}
