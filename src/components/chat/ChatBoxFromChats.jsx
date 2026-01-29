import { useEffect } from "react";
import ChatBox from "./ChatBox";
import { useChat } from "../../context/ChatContext";

export default function ChatBoxFromChats({ chat, onBack }) {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const myId = auth?.user?._id;

  const { resetUnreadForChat } = useChat();

  const otherUser = chat.members.find(
    (m) => String(m._id) !== String(myId)
  );

  useEffect(() => {
    if (chat?.chatId) {
      resetUnreadForChat(chat.chatId); 
    }
  }, [chat?.chatId, resetUnreadForChat]);

  return (
    <ChatBox
      chatId={chat.chatId}
      otherUser={otherUser}
      skipPermission
      onClose={onBack}
    />
  );
}
