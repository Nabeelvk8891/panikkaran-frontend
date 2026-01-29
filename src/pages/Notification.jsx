import {
  FiBell,
  FiCheck,
  FiArrowLeft,
  FiTrash2,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useNotifications } from "../context/notificationContext";
import {
  markAllNotificationsRead,
  clearAllNotifications,
} from "../services/notificationApi";

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, setNotifications } = useNotifications();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ✅ Mark all as read */
  const markAllRead = async () => {
    setLoading(true);
    await markAllNotificationsRead();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
    setLoading(false);
  };

  /* 🗑️ Clear all (DB) */
  const confirmClearAll = async () => {
    setLoading(true);
    await clearAllNotifications();
    setNotifications([]);
    setLoading(false);
    setShowClearConfirm(false);
  };

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* ===== Header ===== */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FiBell className="text-blue-600" size={22} />
            <h1 className="text-xl font-semibold text-gray-800">
              Notifications
            </h1>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft />
            Close
          </button>
        </div>

        {/* ===== Actions ===== */}
        {notifications.length > 0 && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={markAllRead}
              disabled={loading}
              className="
                flex items-center gap-2
                px-3 py-2 text-sm font-medium
                bg-blue-50 text-blue-600
                rounded-lg
                hover:bg-blue-100
                transition
                disabled:opacity-60
              "
            >
              <FiCheck />
              Mark all as read
            </button>

            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={loading}
              className="
                flex items-center gap-2
                px-3 py-2 text-sm font-medium
                bg-red-50 text-red-600
                rounded-lg
                hover:bg-red-100
                transition
                disabled:opacity-60
              "
            >
              <FiTrash2 />
              Clear all
            </button>
          </div>
        )}

        {/* ===== Empty State ===== */}
        {notifications.length === 0 && (
          <div className="bg-white border rounded-xl p-10 text-center">
            <FiBell
              size={32}
              className="mx-auto text-gray-400 mb-3"
            />
            <p className="text-gray-600">
              You have no notifications
            </p>
          </div>
        )}

        {/* ===== Notification List ===== */}
        {notifications.length > 0 && (
          <div className="bg-white border rounded-xl divide-y">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`p-4 ${
                  n.isRead ? "bg-white" : "bg-blue-50"
                }`}
              >
                <p className="font-medium text-gray-800">
                  {n.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {n.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= CLEAR CONFIRM MODAL ================= */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowClearConfirm(false)}
          />

          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Clear notifications?
            </h2>

            <p className="text-sm text-gray-600 mt-2">
              This will permanently delete all your notifications.
              This action cannot be undone.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowClearConfirm(false)}
                disabled={loading}
                className="
                  flex-1 rounded-xl
                  border border-gray-300
                  py-2.5 text-sm
                  text-gray-700
                  hover:bg-gray-100
                  transition
                "
              >
                Cancel
              </button>

              <button
                onClick={confirmClearAll}
                disabled={loading}
                className="
                  flex-1 rounded-xl
                  bg-red-600
                  py-2.5 text-sm
                  text-white
                  hover:bg-red-700
                  transition
                "
              >
                {loading ? "Clearing..." : "Clear all"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Notifications;
