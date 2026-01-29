import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaBriefcase,
  FaChartBar,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { FaCircleExclamation } from "react-icons/fa6";

import Logo from "../../assets/panikkaran.png";
import { logout } from "../../utils/auth";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* 🔑 Sync sidebar width with layout */
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      expanded ? "260px" : "72px"
    );
  }, [expanded]);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
    setMobileOpen(false);
  };

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* ===== MOBILE TOP BAR ===== */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-white border-b z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src={Logo} className="h-7" />
          <span className="font-semibold text-blue-600">Admin</span>
        </div>
        <button onClick={() => setMobileOpen(true)}>
          <FaBars size={20} />
        </button>
      </div>

      {/* ===== MOBILE OVERLAY ===== */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className="
          fixed top-0 left-0 h-full bg-white border-r z-50
          hidden md:flex flex-col
          transition-[width] duration-300
        "
        style={{ width: expanded ? 260 : 72 }}
      >
        <SidebarHeader />

        <SidebarNav expanded={expanded} onNav={handleNavClick} />

        <SidebarFooter onLogout={handleLogout} expanded={expanded} />
      </aside>

      {/* ===== MOBILE DRAWER ===== */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-[260px] bg-white border-r z-50
          transform transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:hidden
        `}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <img src={Logo} className="h-8" />
            <span className="font-semibold text-blue-600">
              Panikkaran Admin
            </span>
          </div>
          <button onClick={() => setMobileOpen(false)}>
            <FaTimes />
          </button>
        </div>

        <SidebarNav expanded onNav={handleNavClick} />
        <SidebarFooter onLogout={handleLogout} expanded />
      </aside>
    </>
  );
}

/* ===== SUB COMPONENTS ===== */

function SidebarHeader() {
  return (
    <div className="h-14 flex items-center justify-center border-b">
      <img src={Logo} className="h-8" />
    </div>
  );
}

function SidebarNav({ expanded, onNav }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      <Item to="/admin" icon={<FaChartBar />} expanded={expanded} onNav={onNav}>
        Dashboard
      </Item>
      <Item to="/admin/users" icon={<FaUsers />} expanded={expanded} onNav={onNav}>
        Users
      </Item>
      <Item to="/admin/jobs" icon={<FaBriefcase />} expanded={expanded} onNav={onNav}>
        Jobs
      </Item>
      <Item to="/admin/reports" icon={<FaCircleExclamation />} expanded={expanded} onNav={onNav}>
        Reports
      </Item>
    </nav>
  );
}

function SidebarFooter({ onLogout, expanded }) {
  return (
    <div className="border-t p-3">
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                   text-red-600 hover:bg-red-50 transition"
      >
        <FaSignOutAlt />
        <span
          className={`transition-opacity duration-200 ${
            expanded ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          Logout
        </span>
      </button>
    </div>
  );
}

function Item({ to, icon, expanded, children, onNav }) {
  return (
    <NavLink
      to={to}
      end
      onClick={onNav}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg
         transition font-medium relative
         ${
           isActive
             ? "bg-blue-50 text-blue-600"
             : "text-gray-700 hover:bg-gray-100"
         }`
      }
    >
      <span className="text-lg shrink-0">{icon}</span>

      {/* Reserve space to prevent icon jump */}
      <span
        className={`whitespace-nowrap transition-opacity duration-200 ${
          expanded ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </span>
    </NavLink>
  );
}
