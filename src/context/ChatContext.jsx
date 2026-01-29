import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { socket } from "../utils/socket";
import { getUser } from "../utils/auth";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const user = getUser();

  /**
   * chatUnreadMap = {
   *   chatId1: 2,
   *   chatId2: 1
   * }
   */
  const [chatUnreadMap, setChatUnreadMap] = useState({});

  // 🔥 ACTIVE CHAT TRACKER (KEY FIX)
  const [activeChatId, setActiveChatId] = useState(null);

  /* ================= SOCKET LISTENER ================= */
  useEffect(() => {
    if (!user?._id) {
      setChatUnreadMap({});
      return;
    }

    const handleNewMessage = ({ chatId, sender }) => {
      // ignore my own messages
      if (String(sender) === String(user._id)) return;
      if (!chatId) return;

      // 🔥 DO NOT COUNT UNREAD IF CHAT IS OPEN
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

  /* ================= CLEAR ALL (OPTIONAL) ================= */
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
        /* 🔴 NAVBAR TOTAL */
        unreadChatCount,

        /* 🟢 CHAT LIST MAP */
        chatUnreadMap,

        /* 🔵 CLEARERS */
        clearChatUnread,
        resetUnreadForChat: clearChatUnread,
        resetUnreadChats,

        /* 🔥 ACTIVE CHAT CONTROL */
        activeChatId,
        setActiveChatId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
