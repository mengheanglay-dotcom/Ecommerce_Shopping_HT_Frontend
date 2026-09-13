import { Link } from "react-router-dom";
import {
  FiChevronDown,
  FiGrid,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiSettings,
  FiTag,
  FiLayers,
  FiX,
} from "react-icons/fi";

const navItems = [
  { id: "overview", label: "Overview", icon: FiGrid },
  { id: "products", label: "Products", icon: FiBox },
  { id: "orders", label: "Orders", icon: FiShoppingBag, badge: "12" },
  { id: "customers", label: "Customers", icon: FiUsers },
  { id: "categories", label: "Categories", icon: FiLayers },
  { id: "brands", label: "Brands", icon: FiTag },
  { id: "sizes", label: "Sizes", icon: FiLayers },
  { id: "colors", label: "Colors", icon: FiTag },
];

export default function AdminSidebar({ section, open, onSelect, onClose, orderCount }) {
  return (
    <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
      <div className="admin-brand">
        <span className="admin-brand-mark">S</span>
        <div>
          <strong>SHOP</strong>
          <small>CONTROL CENTER</small>
        </div>
        <button className="admin-close" onClick={onClose}>
          <FiX />
        </button>
      </div>
      <div className="admin-profile">
        <div className="admin-avatar">AD</div>
        <div>
          <strong>Administrator</strong>
          <span>API control panel</span>
        </div>
        <FiChevronDown className="admin-profile-chevron" />
      </div>
      <nav className="admin-nav">
        <span className="admin-nav-label">Workspace</span>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={section === item.id ? "active" : ""}
              onClick={() => onSelect(item.id)}
            >
              <Icon />
              <span>{item.label}</span>
              {item.id === "orders" && orderCount > 0 && <b>{orderCount}</b>}
            </button>
          );
        })}
      </nav>
      <div className="admin-nav admin-nav-bottom">
        <span className="admin-nav-label">Account</span>
        <button
          className={section === "settings" ? "active" : ""}
          onClick={() => onSelect("settings")}
        >
          <FiSettings />
          <span>Settings</span>
        </button>
        <Link to="/" className="admin-store-link">
          <span>←</span>
          <span>View storefront</span>
        </Link>
      </div>
      <div className="admin-sidebar-footer">
        <span className="admin-status-dot" /> All systems operational
      </div>
    </aside>
  );
}
