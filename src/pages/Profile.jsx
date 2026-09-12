import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getCurrentUser,
  updateCurrentUser,
  logout,
  isAuthenticated,
  getStoredUser,
} from "../api/authApi";

export default function Profile() {
  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const [user, setUser] = useState(storedUser);
  const [form, setForm] = useState({
    name: storedUser?.name || "",
    email: storedUser?.email || "",
    phone: storedUser?.phone || "",
    address: storedUser?.address || "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    let active = true;
    getCurrentUser()
      .then((u) => {
        if (!active) return;
        setUser(u);
        setForm({
          name: u?.name || "",
          email: u?.email || "",
          phone: u?.phone || "",
          address: u?.address || "",
        });
      })
      .catch((e) => {
        if (!active) return;
        if (e.response?.status === 401) {
          navigate("/login");
          return;
        }
        setError(
          "Unable to refresh profile. You can still edit your saved details.",
        );
      });
    return () => {
      active = false;
    };
  }, [navigate]);
  const save = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const u = await updateCurrentUser(form);
      setUser(u);
      setForm({
        name: u?.name || "",
        email: u?.email || "",
        phone: u?.phone || "",
        address: u?.address || "",
      });
      window.dispatchEvent(new Event("authchange"));
      setMessage("Profile updated successfully.");
    } catch (e) {
      setError(e.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };
  const signout = async () => {
    await logout();
    window.dispatchEvent(new Event("authchange"));
    navigate("/");
  };
  if (!user)
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        Loading profile...
      </div>
    );
  return (
    <main className="max-w-3xl mx-auto px-5 py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[.25em] text-neutral-400 font-semibold">
            ACCOUNT
          </p>
          <h1 className="text-4xl font-semibold mt-2">My profile</h1>
        </div>
        <button
          onClick={signout}
          className="border rounded-full px-5 py-2 text-sm"
        >
          Log out
        </button>
      </div>
      {message && (
        <p className="mt-6 bg-green-50 text-green-700 p-3 rounded-lg text-sm">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </p>
      )}
      <form onSubmit={save} className="mt-8 border rounded-2xl p-6 space-y-5">
        {[
          ["name", "Full name"],
          ["email", "Email"],
          ["phone", "Phone"],
          ["address", "Address"],
        ].map(([key, label]) => (
          <label key={key} className="block text-sm font-medium">
            {label}
            {key === "address" ? (
              <textarea
                rows="4"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="mt-1.5 w-full border rounded-lg px-3 py-2.5"
              />
            ) : (
              <input
                type={key === "email" ? "email" : "text"}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="mt-1.5 w-full border rounded-lg px-3 py-2.5"
              />
            )}
          </label>
        ))}
        <div className="flex gap-3">
          <button
            disabled={saving}
            className="bg-black text-white rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <Link to="/orders" className="border rounded-full px-6 py-3 text-sm">
            My orders
          </Link>
        </div>
      </form>
    </main>
  );
}
