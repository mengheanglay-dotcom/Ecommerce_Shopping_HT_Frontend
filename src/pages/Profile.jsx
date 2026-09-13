import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  LogOut,
  Package,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  getCurrentUser,
  updateCurrentUser,
  logout,
  isAuthenticated,
  getStoredUser,
} from "../api/authApi";

const FIELDS = [
  { key: "name", label: "Full name", icon: User, type: "text" },
  { key: "email", label: "Email", icon: Mail, type: "email" },
  { key: "phone", label: "Phone", icon: Phone, type: "text" },
  { key: "address", label: "Address", icon: MapPin, type: "textarea" },
];

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
          "Unable to refresh profile. You can still edit your saved details."
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
      <div className="min-h-[70vh] flex items-center justify-center gap-2 text-neutral-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading profile...</span>
      </div>
    );

  const initials = (user.name || user.email || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <main className="max-w-2xl mx-auto px-5 py-16">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-lg font-semibold shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-semibold leading-tight">
              {user.name || "My profile"}
            </h1>
            <p className="text-sm text-neutral-500">{user.email}</p>
          </div>
        </div>
        <button
          onClick={signout}
          className="flex items-center gap-1.5 border rounded-full pl-4 pr-5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>

      {/* Feedback */}
      {message && (
        <div className="mb-6 flex items-start gap-2 bg-green-50 text-green-700 p-3 rounded-lg text-sm">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 flex items-start gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={save} className="border rounded-2xl p-6 space-y-5">
        {FIELDS.map(({ key, label, icon: Icon, type }) => (
          <label key={key} className="block text-sm font-medium text-neutral-800">
            {label}
            <div className="relative mt-1.5">
              <Icon className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
              {type === "textarea" ? (
                <textarea
                  rows="3"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-shadow"
                />
              ) : (
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-shadow"
                />
              )}
            </div>
          </label>
        ))}

        <div className="flex gap-3 pt-1">
          <button
            disabled={saving}
            className="flex items-center gap-2 bg-black text-white rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50 hover:bg-neutral-800 transition-colors"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving..." : "Save changes"}
          </button>
          <Link
            to="/orders"
            className="flex items-center gap-2 border rounded-full px-6 py-3 text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            <Package className="w-4 h-4" />
            My orders
          </Link>
        </div>
      </form>
    </main>
  );
}