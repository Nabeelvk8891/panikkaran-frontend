import { useEffect, useState, useRef } from "react";
import { socket } from "../../utils/socket";
import { timeAgo } from "../../utils/timeAgo";
import { FiMoreVertical } from "react-icons/fi";
import {
  clearChatForMe,
  deleteChatForBoth,
} from "../../services/chatApi";

export default function ChatHeader({ otherUser, chatId, onClose }) {
  const [online, setOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(otherUser?.lastSeen || null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmType, setConfirmType] = useState(null); 
  const menuRef = useRef(null);

  /* ================= PRESENCE ================= */
  useEffect(() => {
    if (!otherUser?._id) return;

    const otherId = String(otherUser._id);

    const handlePresence = (payload) => {
      const onlineUsers = payload?.onlineUsers || [];
      setOnline(onlineUsers.includes(otherId));
    };

    socket.on("presence", handlePresence);
    socket.emit("online-check");

    return () => {
      socket.off("presence", handlePresence);
    };
  }, [otherUser?._id]);

  useEffect(() => {
    if (otherUser?.lastSeen) {
      setLastSeen(otherUser.lastSeen);
    }
  }, [otherUser?.lastSeen]);

  /* ================= CLOSE MENU ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ================= ACTION HANDLERS ================= */
  const handleClearChat = async () => {
  await clearChatForMe(chatId);
  setConfirmType(null);

  window.dispatchEvent(
    new CustomEvent("chat-cleared", {
      detail: { chatId },
    })
  );

  window.dispatchEvent(new Event("refresh-chats"));
};


  const handleDeleteChat = async () => {
    await deleteChatForBoth(chatId);
    setConfirmType(null);
    onClose(); 
  };

  const avatar =
    otherUser.profileImage?.trim()
      ? otherUser.profileImage
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          otherUser.name
        )}`;

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            alt={otherUser.name}
            className="h-10 w-10 rounded-full object-cover"
          />

          <div className="flex flex-col">
            <span className="font-medium text-sm">
              {otherUser.name}
            </span>

            <span className="text-xs text-gray-500 flex items-center gap-1">
              {online ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Online
                </>
              ) : lastSeen ? (
                `Last seen ${timeAgo(lastSeen)}`
              ) : (
                "Offline"
              )}
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 relative" ref={menuRef}>
          {/* MENU BUTTON */}
          <button
            onClick={() => setMenuOpen((p) => !p)}
            className="text-gray-600 hover:text-black"
            aria-label="Chat menu"
          >
            <FiMoreVertical size={20} />
          </button>

          {/* CLOSE BUTTON */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-500 hover:text-red-500 text-lg font-semibold"
            aria-label="Close chat"
          >
            ✕
          </button>

          {/* MENU */}
          {menuOpen && (
            <div className="absolute right-0 top-10 w-44 bg-white border rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmType("clear");
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Clear chat
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmType("delete");
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= CONFIRM MODAL ================= */}
      {confirmType && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 w-[90%] max-w-sm">
            <h3 className="font-semibold text-lg mb-2">
              {confirmType === "clear"
                ? "Clear this chat?"
                : "Delete this chat?"}
            </h3>

            <p className="text-sm text-gray-500 mb-4">
              {confirmType === "clear"
                ? "Messages will be removed only for you."
                : "This will permanently delete the chat for both users."}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmType(null)}
                className="px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={
                  confirmType === "clear"
                    ? handleClearChat
                    : handleDeleteChat
                }
                className="px-4 py-2 bg-red-500 text-white rounded-md text-sm"
              >
                {confirmType === "clear" ? "Clear" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
