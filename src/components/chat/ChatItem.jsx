import { timeAgo } from "../../utils/timeAgo";
import { useChat } from "../../context/ChatContext";


export default function ChatItem({ chat, onClick }) {
  if (!chat || !Array.isArray(chat.members)) return null;

  const { chatUnreadMap } = useChat();

  const auth = JSON.parse(localStorage.getItem("auth"));
  const myId = auth?.user?._id;

  const otherUser = chat.members.find(
    (m) => m && String(m._id) !== String(myId)
  );

  if (!otherUser) return null;

  

  /* ================= AVATAR ================= */
  const avatar =
    otherUser.profileImage?.trim()
      ? otherUser.profileImage
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          otherUser.name
        )}`;

  /* ================= UNREAD ================= */
  // 🔑 MUST USE chat.chatId
  const unreadCount = chatUnreadMap?.[chat.chatId] || 0;
  const hasUnread = unreadCount > 0;

  /* ================= LAST MESSAGE (SAFE) ================= */
  const lastText =
    chat.lastMessage && typeof chat.lastMessage === "object"
      ? chat.lastMessage.text
      : null;

 let lastTime = null;

if (chat.lastMessage && typeof chat.lastMessage === "object") {
  const t = new Date(chat.lastMessage.createdAt);
  if (!isNaN(t.getTime())) {
    lastTime = t;
  }
}
if (!lastTime && chat.updatedAt) {
  const t = new Date(chat.updatedAt);
  if (!isNaN(t.getTime())) {
    lastTime = t;
  }
}

  return (
    <div
      onClick={onClick}
      className="
        group
        flex gap-3
        px-4 py-3
        bg-white
        hover:bg-[#f5f6f6]
        active:bg-[#e9edef]
        cursor-pointer
        transition-colors duration-150
        min-h-[72px]
        items-center
        border-b border-gray-200
      "
    >
      {/* ================= AVATAR ================= */}
      <div className="relative shrink-0">
        <img
          src={avatar}
          alt={otherUser.name}
          className="
            w-11 h-11
            rounded-full
            object-cover
            ring-1 ring-gray-200
          "
        />

        {/* 🟢 UNREAD DOT */}
        {hasUnread && (
          <span
            className="
              absolute -right-0.5 -bottom-0.5
              w-3 h-3
              bg-[#25D366]
              rounded-full
              border-2 border-white
            "
          />
        )}
      </div>

      {/* ================= TEXT ================= */}
      <div className="flex-1 min-w-0">
        {/* NAME + TIME */}
        <div className="flex justify-between items-center gap-2">
          <span
            className={`truncate text-sm ${
              hasUnread
                ? "text-gray-900 font-semibold"
                : "text-gray-700 font-medium"
            }`}
          >
            {otherUser.name}
          </span>

          {lastTime && (
            <span
              className={`text-xs shrink-0 ${
                hasUnread
                  ? "text-[#25D366] font-medium"
                  : "text-gray-500"
              }`}
            >
              {timeAgo(lastTime)}
            </span>
          )}
        </div>

        {/* MESSAGE + COUNT */}
        <div className="flex justify-between items-center gap-2 mt-0.5">
          <p
            className={`text-sm truncate leading-snug ${
              hasUnread
                ? "text-gray-900 font-medium"
                : "text-gray-600"
            }`}
          >
            {lastText || "No messages yet"}
          </p>

          {/* 🔢 UNREAD COUNT */}
          {hasUnread && unreadCount > 1 && (
            <span
              className="
                bg-[#25D366]
                text-white
                text-xs
                font-medium
                px-2
                py-[2px]
                rounded-full
                shrink-0
              "
            >
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
