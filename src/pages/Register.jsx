import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/authApi";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.password_confirmation)
      return setError("Passwords do not match.");
    setLoading(true);
    try {
      await register(form);
      window.dispatchEvent(new Event("authchange"));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
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
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-slate-500 text-sm mt-1">
            Register with your real account.
          </p>
        </div>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-600 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium">
            Full name
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              className="mt-1.5 w-full border rounded-lg px-3 py-2.5"
            />
          </label>
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
              className="mt-1.5 w-full border rounded-lg px-3 py-2.5"
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              type="password"
              minLength="6"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              className="mt-1.5 w-full border rounded-lg px-3 py-2.5"
            />
          </label>
          <label className="block text-sm font-medium">
            Confirm password
            <input
              type="password"
              value={form.password_confirmation}
              onChange={(e) => update("password_confirmation", e.target.value)}
              required
              className="mt-1.5 w-full border rounded-lg px-3 py-2.5"
            />
          </label>
          <button
            disabled={loading}
            className="w-full bg-black text-white rounded-lg py-3 font-semibold disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        <p className="text-sm text-slate-500 text-center mt-5">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-black">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
