import {
  FiActivity,
  FiArchive,
  FiChevronDown,
  FiTruck,
  FiUsers,
} from "react-icons/fi";
import SectionHeading from "../components/SectionHeading";

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
  return (
    <div className="admin-content">
      <SectionHeading eyebrow="STORE CONFIGURATION" title="Settings" />
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
