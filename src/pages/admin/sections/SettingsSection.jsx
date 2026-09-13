import {
  FiActivity,
  FiArchive,
  FiChevronDown,
  FiTruck,
  FiUsers,
} from "react-icons/fi";
import SectionHeading from "../components/SectionHeading";
import { useEffect, useState } from "react";
import { getStoredUser } from "../../../api/authApi";
import { updateAdminUser } from "../../../api/adminApi";

const settings = [
  [
    FiTruck,
    "Shipping & delivery",
    "Manage delivery zones, rates, and fulfillment windows.",
  ],
  [
    FiArchive,
    "Payment methods",
    "Configure the payment options available at checkout.",
  ],
  [
    FiUsers,
    "Team access",
    "Invite staff and manage permissions for your store.",
  ],
  [FiActivity, "Notifications", "Choose which store events send an alert."],
];

export default function SettingsSection() {
  const storedUser = getStoredUser() || {};
  const [form, setForm] = useState({
    name: storedUser.name || "",
    email: storedUser.email || "",
    phone: storedUser.phone || "",
  });
  const [message, setMessage] = useState("");
  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      const result = await updateAdminUser(storedUser.id, form);
      localStorage.setItem("user", JSON.stringify(result?.user || result || form));
      setMessage("Administrator profile updated.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update profile.");
    }
  };
  return (
    <div className="admin-content">
      <SectionHeading eyebrow="STORE CONFIGURATION" title="Settings" />
      <form className="admin-panel" style={{ padding: 24, marginBottom: 20 }} onSubmit={saveProfile}>
        <h3>Administrator profile</h3>
        <div className="admin-form-grid">
          {["name", "email", "phone"].map((field) => (
            <label key={field}>
              {field[0].toUpperCase() + field.slice(1)}
              <input
                value={form[field]}
                onChange={(event) => setForm({ ...form, [field]: event.target.value })}
              />
            </label>
          ))}
        </div>
        <button className="admin-primary" type="submit">Save profile</button>
        {message && <p className="admin-muted">{message}</p>}
      </form>
      <div className="admin-settings-grid">
        {settings.map(([Icon, title, description]) => (
          <div className="admin-panel settings-card" key={title}>
            <Icon />
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
            <FiChevronDown />
          </div>
        ))}
      </div>
    </div>
  );
}
