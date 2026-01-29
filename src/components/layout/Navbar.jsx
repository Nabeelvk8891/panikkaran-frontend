import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import NotificationBell from "../../components/Notification/NotificationBell.jsx";
import { FiMessageCircle, FiBell } from "react-icons/fi";
import { useChat } from "../../context/ChatContext";

import Logo from "../../assets/panikkaran.png";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaSearch,
  FaBars,
  FaTimes,
  FaHome,
  FaCalendarCheck,
} from "react-icons/fa";

import { getUser, logout } from "../../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const { unreadChatCount } = useChat();

  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [navHidden, setNavHidden] = useState(false);

  /* ================= SYNC AUTH ================= */
  useEffect(() => {
    setUser(getUser());
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /* ================= SCROLL HIDE ================= */
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (mobileOpen) return;

      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setNavHidden(true);
      } else {
        setNavHidden(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileOpen]);

  /* ================= CLICK OUTSIDE PROFILE ================= */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loggedIn = !!user;

  const handleLogout = () => {
    logout();
    setConfirmLogout(false);
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav
        className={`w-full bg-white border-b fixed top-0 z-50
        transition-transform duration-300
        ${navHidden ? "-translate-y-full" : "translate-y-0 shadow-sm"}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="Panikkaran logo" className="h-10" />
            <span className="text-2xl font-bold text-blue-600">
              Panikkaran
            </span>
          </Link>

          {/* ================= DESKTOP ================= */}
          <div className="hidden md:flex items-center gap-4">
            {!loggedIn ? (
              <>
                <Link to="/login" className="text-gray-700 font-medium">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <NavItem to="/dashboard" icon={<FaHome />}>
                  Dashboard
                </NavItem>
                <NavItem to="/appointments" icon={<FaCalendarCheck />}>
                  Appointments
                </NavItem>
                <NavItem to="/workers" icon={<FaSearch />}>
                  Find Workers
                </NavItem>

                <NavItem
                  to="/chats"
                  icon={
                    <div className="relative w-5 h-5 flex items-center justify-center">
                      <FiMessageCircle className="text-xl scale-110" />
                      {unreadChatCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
                          {unreadChatCount}
                        </span>
                      )}
                    </div>
                  }
                >
                </NavItem>

                <NotificationBell />

                {/* PROFILE */}
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setProfileOpen(!profileOpen)}>
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        className="h-9 w-9 rounded-full object-cover border"
                      />
                    ) : (
                      <FaUserCircle size={28} className="text-gray-600" />
                    )}
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-3 w-44 bg-white border rounded-xl shadow-lg py-2">
                      <button
                        onClick={() => navigate("/profile")}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <FaUserCircle />
                        View Profile
                      </button>

                      <div className="my-1 h-px bg-gray-200" />

                      <button
                        onClick={() => setConfirmLogout(true)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <FaSignOutAlt />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ================= MOBILE TOP ICONS ================= */}
{loggedIn && (
  <div className="flex items-center gap-4 md:hidden">
    {/* CHAT */}
    <button
      onClick={() => navigate("/chats")}
      className="relative"
    >
      <FiMessageCircle className="text-xl scale-110" />

      {unreadChatCount > 0 && (
        <span
          className="
            absolute -top-2 -right-2
            bg-red-600 text-white
            text-[11px] font-semibold
            h-[18px] min-w-[18px]
            px-1
            rounded-full
            flex items-center justify-center
            leading-none
          "
        >
          {unreadChatCount > 9 ? "9+" : unreadChatCount}
        </span>
      )}
    </button>

    {/* NOTIFICATIONS */}
    <div className="relative">
      <NotificationBell />
    </div>

    {/* MENU */}
    <button onClick={() => setMobileOpen(true)}>
      <FaBars size={22} />
    </button>
  </div>
)}

{!loggedIn && (
  <button className="md:hidden" onClick={() => setMobileOpen(true)}>
    <FaBars size={22} />
  </button>
)}

        </div>
      </nav>

      {/* ================= MOBILE BACKDROP ================= */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ================= MOBILE MENU ================= */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50
        transform transition-transform duration-300 md:hidden
        ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <span className="text-lg font-semibold">Menu</span>
          <button onClick={() => setMobileOpen(false)}>
            <FaTimes size={22} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {!loggedIn ? (
            <>
              <MobileNavItem to="/login">Login</MobileNavItem>
              <MobileNavItem to="/register">Register</MobileNavItem>
            </>
          ) : (
            <>
              {/* PROFILE CARD */}
              <div className="flex items-center gap-3 border rounded-xl p-3">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle size={36} />
                )}
                <div>
                  <p className="font-medium">{user.name}</p>
                  <Link to="/profile" className="text-sm text-blue-600">
                    View profile →
                  </Link>
                </div>
              </div>

              <MobileNavItem to="/dashboard">
                <FaHome /> Dashboard
              </MobileNavItem>

              <MobileNavItem to="/appointments">
                <FaCalendarCheck /> Appointments
              </MobileNavItem>

              <MobileNavItem to="/workers">
                <FaSearch /> Find Workers
              </MobileNavItem>

              <MobileNavItem to="/chats">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <FiMessageCircle className="text-lg" />
                    <span>Chats</span>
                  </div>
                  {unreadChatCount > 0 && (
                    <span className="bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      {unreadChatCount}
                    </span>
                  )}
                </div>
              </MobileNavItem>

              <button
                onClick={() => navigate("/notifications")}
                className="flex items-center gap-3 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-200 transition"
              >
                <FiBell />
                <span className="text-sm font-medium text-gray-700">
                  Notifications
                </span>
              </button>

              <button
                onClick={() => setConfirmLogout(true)}
                className="flex items-center gap-2 text-red-600 text-sm mt-4"
              >
                <FaSignOutAlt /> Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* ================= LOGOUT CONFIRM ================= */}
      {confirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmLogout(false)}
          />

          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-900 text-center">
              Confirm Logout
            </h2>

            <p className="text-sm text-gray-600 mt-2 mb-6 text-center">
              Are you sure you want to logout?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ================= REUSABLE ================= */

function NavItem({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
          isActive
            ? "bg-blue-50 text-blue-600"
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}

function MobileNavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
          isActive
            ? "bg-blue-50 text-blue-600"
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      {children}
    </NavLink>
  );
}
