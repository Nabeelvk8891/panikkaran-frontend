import { useState } from "react";
import ChatList from "../components/chat/ChatList";
import ChatBoxFromChats from "../components/chat/ChatBoxFromChats";
import { useChat } from "../context/ChatContext";

export default function ChatsPage() {
  const [activeChat, setActiveChat] = useState(null);
  const { resetUnreadForChat } = useChat();

  return (
    <div className="fixed inset-0 bg-[#e3e9f4] flex flex-col">
      <div className="h-[72px] shrink-0"></div>

      <div className="flex-1 overflow-hidden p-3 sm:p-4">
        <div className="flex h-full w-full overflow-hidden rounded-xl shadow-lg bg-white">
          {/* LEFT: CHAT LIST */}
          <div
            className={`
              flex flex-col
              w-full sm:w-[360px] md:w-[400px]
              bg-[#e3e9f4]
              ${activeChat ? "hidden sm:flex" : "flex"}
            `}
          >
            <ChatList
              onSelectChat={(chat) => {
                resetUnreadForChat(chat.chatId); // 🔥 FIX
                setActiveChat(chat);
              }}
            />
          </div>

          {/* RIGHT: CHAT BOX */}
          <div
            className={`
              flex-1 flex flex-col bg-[#e3e9f4]
              ${activeChat ? "flex" : "hidden sm:flex"}
            `}
          >
            {activeChat ? (
              <ChatBoxFromChats
                chat={activeChat}
                onBack={() => setActiveChat(null)}
              />
            ) : (
              <div className="hidden sm:flex h-full items-center justify-center">
                <div className="text-center text-gray-400">
                  <p className="text-lg font-medium">No chat selected</p>
                  <p className="text-sm mt-1">
                    Choose a conversation to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
