import { FiHeart, FiMenu } from "react-icons/fi";

export default function AdminTopbar({ section, onMenuOpen, title }) {
  return (
    <header className="admin-topbar">
      <button className="admin-menu-button" onClick={onMenuOpen}>
        <FiMenu />
      </button>
      <div>
        <p className="admin-kicker">Monday, September 7, 2026</p>
        <h1>{title[section]}</h1>
      </div>
      <div className="admin-top-actions">
        <button className="admin-icon-button">
          <FiHeart />
        </button>
        <div className="admin-top-avatar">AM</div>
      </div>
    </header>
  );
}
