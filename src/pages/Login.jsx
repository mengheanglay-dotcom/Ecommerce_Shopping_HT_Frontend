import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/authApi";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await login(form);
      const user = result.user;
      navigate(user?.is_admin || user?.role === "admin" ? "/admin" : "/");
      window.dispatchEvent(new Event("authchange"));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your username and password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-10">
        <Link to="/" className="text-2xl font-black tracking-[-0.08em]">
          SHOP
        </Link>
        <div className="mt-8 mb-6">
          <h1 className="text-2xl font-bold">Log In</h1>
          <p className="text-slate-500 text-sm mt-1">
            Sign in to your SHOP account.
          </p>
        </div>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-600 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium">
            Username or email
            <input
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              required
              className="mt-1.5 w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-black/10"
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              className="mt-1.5 w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-black/10"
            />
          </label>
          <button
            disabled={loading}
            className="w-full bg-black text-white rounded-lg py-3 font-semibold disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <p className="text-sm text-slate-500 text-center mt-5">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-black">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
