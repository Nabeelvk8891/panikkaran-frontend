import { useRef, useState } from "react";
import { socket } from "../../utils/socket";
import { FaPaperPlane } from "react-icons/fa";

export default function ChatInput({
  chatId,
  myId,
  setMessages,
  replyingTo,
  setReplyingTo,
}) {
  const [text, setText] = useState("");

  // 🔒 SEND LOCK (CRITICAL FIX)
  const sendingRef = useRef(false);

  const sendMessage = () => {
    if (!text.trim()) return;
    if (sendingRef.current) return; // 🚫 BLOCK DOUBLE SEND

    sendingRef.current = true;

    const tempId = `temp-${Date.now()}-${Math.random()}`;

    const optimisticMessage = {
      _id: tempId,
      tempId,
      chatId,
      sender: myId,
      text,
      delivered: false,
      seen: false,
      createdAt: new Date().toISOString(),
      replyTo: replyingTo?._id || null,
      replyText: replyingTo?.text || null,
      replySender: replyingTo?.sender || null,
    };

    // optimistic UI
    setMessages((prev) => [...prev, optimisticMessage]);

    // send to server
    socket.emit("sendMessage", {
      chatId,
      text,
      sender: myId,
      tempId,
      replyTo: replyingTo?._id || null,
      replyText: replyingTo?.text || null,
      replySender: replyingTo?.sender || null,
    });

    setText("");
    setReplyingTo(null);

    // 🔓 RELEASE LOCK (NEXT TICK)
    setTimeout(() => {
      sendingRef.current = false;
    }, 0);
  };

  return (
    <div className="border-t bg-white px-3 py-2 space-y-1">
      {replyingTo && (
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-xs">
          <div className="w-1 self-stretch bg-blue-500 rounded-full" />

          <div className="flex-1 truncate">
            <div className="font-medium text-blue-600">Replying to</div>
            <div className="truncate text-gray-700">
              {replyingTo.text}
            </div>
          </div>

          <button
            onClick={() => setReplyingTo(null)}
            className="text-gray-500 hover:text-red-500 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            socket.emit("typing", { chatId, sender: myId });

            e.target.style.height = "auto";
            e.target.style.height =
              e.target.scrollHeight + "px";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type a message…"
          rows={1}
          className="
            flex-1 resize-none
            rounded-2xl px-4 py-2 text-sm
            border bg-gray-100 focus:outline-none
            focus:ring-2 focus:ring-blue-500
            max-h-32 overflow-y-auto
            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
          "
        />

        <button
          onClick={sendMessage}
          disabled={!text.trim()}
          className="
            h-9 w-9 flex items-center justify-center
            rounded-full bg-blue-600 text-white
            disabled:opacity-40 hover:bg-blue-700
          "
        >
          <FaPaperPlane size={14} />
        </button>
      </div>
    </div>
  );
}
