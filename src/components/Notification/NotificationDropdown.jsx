import { useEffect, useRef } from "react";
import { FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/notificationContext";
import { markNotificationRead } from "../../services/notificationApi";

const NotificationDropdown = ({ onClose }) => {
  const navigate = useNavigate();
  const { notifications, setNotifications } = useNotifications();
  const dropdownRef = useRef(null);

  // 🔹 Mark all unread as read when dropdown opens
  useEffect(() => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    unread.forEach((n) => markNotificationRead(n._id));

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
  }, []);

  // 🔹 Close on outside click / touch
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [onClose]);

  const markAsRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      )
    );
  };

  return (
    <div
      ref={dropdownRef}
      className="
        fixed sm:absolute
        inset-x-2 sm:inset-x-auto
        top-16 sm:top-auto
        sm:right-0
        w-[calc(100%-1rem)] sm:w-[360px]
        max-h-[70vh]
        bg-white
        rounded-2xl
        border border-gray-200
        shadow-xl
        z-50
        overflow-hidden
      "
    >
      {/* HEADER */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
          <FiBell className="text-blue-600 text-sm" />
        </div>
        <span className="font-semibold text-gray-800 text-sm">
          Notifications
        </span>
      </div>

      {/* BODY */}
      <div className="max-h-[50vh] overflow-y-auto">
        {notifications.length === 0 && (
          <div className="px-5 py-10 text-sm text-gray-500 text-center">
            No notifications yet
          </div>
        )}

        {notifications.slice(0, 5).map((n) => (
          <div
            key={n._id}
            onClick={() => markAsRead(n._id)}
            className={`
              px-4 py-3
              border-b last:border-b-0
              transition
              active:bg-gray-100
              ${n.isRead ? "bg-white" : "bg-blue-50"}
            `}
          >
            <div className="flex gap-3 items-start">
              {!n.isRead && (
                <span className="w-2 h-2 mt-2 rounded-full bg-blue-600 shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 leading-tight">
                  {n.title}
                </p>
                <p className="text-xs text-gray-600 mt-1 leading-snug">
                  {n.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="flex border-t bg-gray-50">
        <button
          onClick={() => {
            onClose();
            navigate("/notifications");
          }}
          className="
            flex-1 px-4 py-3
            text-sm font-medium
            text-blue-600
            active:bg-gray-100
          "
        >
          View all
        </button>

        <button
          onClick={onClose}
          className="
            flex-1 px-4 py-3
            text-sm font-medium
            text-gray-600
            active:bg-gray-100
          "
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
