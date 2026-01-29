import { useEffect, useState } from "react";
import { getChats } from "../../services/chatApi";
import ChatItem from "./ChatItem";

export default function ChatList({ onSelectChat }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChats = async () => {
    try {
      const data = await getChats();

      const safeChats = Array.isArray(data)
        ? data.filter(
            (c) =>
              c &&
              c.chatId &&
              Array.isArray(c.members) &&
              c.members.length >= 2
          )
        : [];

      setChats(safeChats);
    } catch (err) {
      console.error("Failed to load chats", err);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    loadChats();
  }, []);

  /* ================= REFRESH AFTER CLEAR CHAT ================= */
  useEffect(() => {
    const refresh = () => {
      loadChats();
    };

    window.addEventListener("refresh-chats", refresh);
    return () =>
      window.removeEventListener("refresh-chats", refresh);
  }, []);

  return (
    // IMPORTANT: h-full ONLY because parent constrains height
    <div className="flex flex-col h-full overflow-hidden bg-[#f0f2f5] rounded-xl shadow-md border border-gray-200">
      {/* ================= HEADER ================= */}
      <div className="shrink-0 px-5 py-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          Chats
        </h2>
      </div>

      {/* ================= SCROLL AREA ================= */}
      <div
        className="
          flex-1
          overflow-y-auto
          overscroll-contain
          touch-pan-y
          px-2
          py-2
        "
      >
        {loading && (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            Loading chats…
          </div>
        )}

        {!loading && chats.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            No chats yet
          </div>
        )}

        <div className="space-y-0.5">
          {chats.map((chat) => (
            <div
              key={chat._id || chat.chatId}
              className="rounded-xl overflow-hidden"
            >
              <ChatItem
                chat={chat}
                onClick={() => onSelectChat(chat)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
