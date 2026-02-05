import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { socket } from "../utils/socket";
import { getUser } from "../utils/auth";
import { getUnreadChatCounts } from "../services/chatApi";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  /* ================= AUTH (REACTIVE) ================= */
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    const syncUser = () => setUser(getUser());

    window.addEventListener("storage", syncUser);
    window.addEventListener("auth-change", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("auth-change", syncUser);
    };
  }, []);

  /* ================= UNREAD STATE ================= */
  const [chatUnreadMap, setChatUnreadMap] = useState({});
  const [unreadHydrated, setUnreadHydrated] = useState(false);

  /* ================= ACTIVE CHAT ================= */
  const [activeChatId, setActiveChatId] = useState(null);

  /* ================= LOAD UNREAD COUNTS ================= */
  useEffect(() => {
    // 🔁 IMPORTANT: reset hydration on auth change
    setUnreadHydrated(false);

    if (!user?._id) {
      setChatUnreadMap({});
      setUnreadHydrated(true);
      return;
    }

    const loadUnreadCounts = async () => {
      try {
        const data = await getUnreadChatCounts();
        setChatUnreadMap(data || {});
      } catch {
        setChatUnreadMap({});
      } finally {
        setUnreadHydrated(true);
      }
    };

    loadUnreadCounts();
  }, [user?._id]);

  /* ================= SOCKET LISTENER ================= */
  useEffect(() => {
    if (!user?._id) return;

    const handleNewMessage = ({ chatId, sender }) => {
      if (!chatId) return;
      if (String(sender) === String(user._id)) return;
      if (chatId === activeChatId) return;

      setChatUnreadMap((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] || 0) + 1,
      }));
    };

    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [user?._id, activeChatId]);

  /* ================= CLEAR PER CHAT ================= */
  const clearChatUnread = useCallback((chatId) => {
    if (!chatId) return;

    setChatUnreadMap((prev) => {
      if (!prev[chatId]) return prev;
      const copy = { ...prev };
      delete copy[chatId];
      return copy;
    });
  }, []);

  /* ================= CLEAR ALL ================= */
  const resetUnreadChats = useCallback(() => {
    setChatUnreadMap({});
  }, []);

  /* ================= TOTAL COUNT ================= */
  const unreadChatCount = Object.values(chatUnreadMap).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <ChatContext.Provider
      value={{
        /* 🔴 NAVBAR */
        unreadChatCount,
        unreadHydrated,

        /* 🟢 CHAT LIST */
        chatUnreadMap,

        /* 🔵 CLEARERS */
        clearChatUnread,
        resetUnreadForChat: clearChatUnread,
        resetUnreadChats,

        /* 🔥 ACTIVE CHAT */
        activeChatId,
        setActiveChatId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
