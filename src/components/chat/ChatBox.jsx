import { useEffect, useRef, useState } from "react";
import { socket } from "../../utils/socket";
import { getChatId } from "../../utils/chat";
import { checkChatPermission } from "../../services/appointmentApi";
import { markAllNotificationsRead } from "../../services/notificationApi";
import { useChat } from "../../context/ChatContext";
import { getMessages } from "../../services/messageApi";



import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

export default function ChatBox({
  appointmentId,
  chatId: directChatId,
  otherUser: directOtherUser,
  skipPermission = false,
  onClose,
}) {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const myId = auth?.user?._id;

  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  /* 🔥 CLEAR STATE */
  const [isCleared, setIsCleared] = useState(false);

  const typingTimeout = useRef(null);
  const joinedRef = useRef(false);

  const { resetUnreadForChat, setActiveChatId } = useChat();

  /* ================= INIT ================= */
  useEffect(() => {
    if (skipPermission && directChatId && directOtherUser) {
      setChatId(directChatId);
      setOtherUser(directOtherUser);
      setAllowed(true);
      return;
    }

    if (!appointmentId) return;

    const init = async () => {
      const res = await checkChatPermission(appointmentId);
      if (!res.data.allowed) return;

      const id = getChatId(
        res.data.userId,
        res.data.workerId
      );

      setChatId(id);
      setOtherUser(res.data.otherUser);
      setAllowed(true);
    };

    init();
  }, [appointmentId, skipPermission, directChatId, directOtherUser]);

/* ================= LOAD HISTORY ================= */
useEffect(() => {
  if (!chatId || isCleared) return;

  const load = async () => {
    try {
      const data = await getMessages(chatId);
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    }
  };

  load();
}, [chatId, isCleared]);


  /* ================= OPEN CHAT ================= */
  useEffect(() => {
    if (!chatId || !myId) return;
    if (document.visibilityState !== "visible") return;

    const hasUnseen = messages.some(
      (m) => String(m.sender) !== String(myId) && !m.seen
    );

    if (hasUnseen) {
      socket.emit("markSeen", {
        chatId,
        userId: myId,
      });
    }
  }, [chatId, myId, messages]);

  useEffect(() => {
    if (!chatId) return;

    setActiveChatId(chatId);

    return () => {
      setActiveChatId(null);
    };
  }, [chatId, setActiveChatId]);

  /* ================= CLEAR CHAT (LOCAL UI) ================= */
 useEffect(() => {
  const handleClear = (e) => {
    const clearedChatId = e.detail?.chatId;

    if (!clearedChatId || clearedChatId !== chatId) return;

    setIsCleared(true);
    setMessages([]);

    resetUnreadForChat(chatId);
    markAllNotificationsRead().catch(() => {});
  };

  window.addEventListener("chat-cleared", handleClear);
  return () =>
    window.removeEventListener("chat-cleared", handleClear);
}, [chatId, resetUnreadForChat]);


  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!chatId || !myId) return;

    if (!socket.connected) socket.connect();

    const joinChat = () => {
      if (joinedRef.current) return;
      joinedRef.current = true;
      socket.emit("joinChat", { chatId, userId: myId });
    };

    joinChat();

    socket.off("receiveMessage");
    socket.off("typing");
    socket.off("seenUpdate");
    socket.off("deliveredUpdate");

    const onReceive = (msg) => {
      setIsCleared(false);

      setMessages((prev) => {
        const tempIndex = prev.findIndex(
          (m) => m.tempId && m.tempId === msg.tempId
        );

        if (tempIndex !== -1) {
          const copy = [...prev];
          copy[tempIndex] = {
            ...msg,
            seen: prev[tempIndex].seen || msg.seen,
            delivered: prev[tempIndex].delivered || msg.delivered,
          };

          return copy;
        }

        return [...prev, msg];
      });

      if (String(msg.sender) !== String(myId)) {
        socket.emit("markSeen", {
          chatId,
          userId: myId,
        });
        setTyping(false);
      }
    };

    const onTyping = () => {
      setTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(
        () => setTyping(false),
        1200
      );
    };

    /* ================= SEEN ================= */
    const onSeen = ({ seenBy }) => {
      if (String(seenBy) === String(myId)) return;

      setMessages((prev) =>
        prev.map((m) => {
          if (
            String(m.sender) === String(myId) &&
            m.delivered &&
            !m.seen
          ) {
            return { ...m, seen: true };
          }
          return m;
        })
      );
    };

    const onDelivered = () => {
      setMessages((prev) =>
        prev.map((m) =>
          String(m.sender) === String(myId)
            ? { ...m, delivered: true }
            : m
        )
      );
    };

    socket.on("receiveMessage", onReceive);
    socket.on("typing", onTyping);
    socket.on("seenUpdate", onSeen);
    socket.on("deliveredUpdate", onDelivered);

    return () => {
      joinedRef.current = false;
      socket.emit("leaveChat", chatId);

      socket.off("receiveMessage", onReceive);
      socket.off("typing", onTyping);
      socket.off("seenUpdate", onSeen);
      socket.off("deliveredUpdate", onDelivered);
    };
  }, [chatId, myId]);

  if (!allowed) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        Chat enabled once appointment is accepted
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden rounded-xl shadow-md border border-gray-200">
      {otherUser && (
        <ChatHeader
          otherUser={otherUser}
          chatId={chatId}
          onClose={onClose}
        />
      )}

      <ChatMessages
        messages={messages}
        typing={typing}
        myId={myId}
        setReplyingTo={setReplyingTo}
        otherUser={otherUser}
      />

      <ChatInput
        chatId={chatId}
        myId={myId}
        setMessages={setMessages}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
      />
    </div>
  );
}
