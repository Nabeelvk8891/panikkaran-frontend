import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "../utils/socket";
import { getNotifications } from "../services/notificationApi";
import { getUser } from "../utils/auth";
import { notificationSound } from "../utils/notificationSound";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useChat } from "./ChatContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(getUser());

  const navigate = useNavigate();

  // 🔒 SAFE access to ChatContext (prevents crash)
  const chatCtx = useChat();
  const activeChatId = chatCtx?.activeChatId ?? null;

  /* ================= AUTH SYNC ================= */
  useEffect(() => {
    const syncUser = () => setUser(getUser());

    window.addEventListener("storage", syncUser);
    window.addEventListener("auth-change", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("auth-change", syncUser);
    };
  }, []);

  /* ================= LOAD FROM DB ================= */
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    getNotifications()
      .then((res) => {
        // 🔒 Always normalize to array
        setNotifications(res?.data?.notifications || []);
      })
      .catch(() => setNotifications([]));
  }, [user]);

  /* ================= SOCKET ================= */
 useEffect(() => {
  if (!user?._id) return;

const handleNewNotification = (data) => {
  if (!data) return;

  // 🔕 If user is already inside the same chat, suppress sound + toast
  if (
    data.type === "message" &&
    data.meta?.chatId &&
    data.meta.chatId === activeChatId
  ) {
    setNotifications((prev) => {
      if (!Array.isArray(prev)) return prev;

      const index = prev.findIndex((n) => n._id === data._id);
      if (index !== -1) {
        const copy = [...prev];
        copy[index] = data;
        return copy;
      }

      return [data, ...prev];
    });

    return;
  }

  /* ================= UPDATE STATE ================= */
  setNotifications((prev) => {
    if (!Array.isArray(prev)) return [data];

    const index = prev.findIndex((n) => n._id === data._id);
    if (index !== -1) {
      const copy = [...prev];
      copy[index] = data;
      return copy;
    }

    return [data, ...prev];
  });

  /* ================= SOUND ================= */
  try {
    notificationSound.play();
  } catch {}

  /* ================= TOAST ================= */
  toast.custom(
    (t) => (
      <div
        onClick={() => {
          toast.dismiss(t.id);

          if (data.type === "message" && data.meta?.appointmentId) {
            navigate(`/appointments?chat=${data.meta.appointmentId}`);
          } else {
            navigate("/notifications");
          }
        }}
        className="
          cursor-pointer
          bg-white border shadow-lg rounded-xl
          px-4 py-3 max-w-sm
          hover:bg-gray-50 transition
        "
      >
        <p className="font-medium text-gray-800">{data.title}</p>
        <p className="text-sm text-gray-600 mt-1">{data.message}</p>
      </div>
    ),
    { duration: 4000 }
  );
};



    /* ---------- CHAT MESSAGE NOTIFICATION ---------- */
  

    socket.on("new-notification", handleNewNotification);

    return () => {
      socket.off("new-notification", handleNewNotification);
    };
  }, [user, navigate, activeChatId]);

  /* ================= DERIVED ================= */
  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.isRead).length
    : 0;

  return (
    <NotificationContext.Provider
      value={{ notifications, setNotifications, unreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
