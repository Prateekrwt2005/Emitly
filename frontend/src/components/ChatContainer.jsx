import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

const Tick = ({ color = "#9CA3AF" }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 20 20"
    fill="none"
    className="rotate-[10deg]"
  >
    <path
      d="M4 10.5L8 14L16 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DoubleTick = ({ color = "#9CA3AF" }) => (
  <div className="flex items-center">
    <Tick color={color} />
    <div className="-ml-1.5 mt-[1px]">
      <Tick color={color} />
    </div>
  </div>
);

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ================= SEEN =================
  useEffect(() => {
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    messages.forEach((msg) => {
      if (msg.senderId === selectedUser._id) {
        socket.emit("messageSeen", {
          messageId: msg._id,
          senderId: msg.senderId,
        });
      }
    });
  }, [messages, selectedUser]);

  return (
    <>
      <ChatHeader />

      <div className="flex-1 px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`chat ${
                  msg.senderId === authUser._id ? "chat-end" : "chat-start"
                }`}
              >
                <div
                  className={`chat-bubble relative ${
                    msg.senderId === authUser._id
                      ? "bg-cyan-800 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Shared"
                      className="rounded-lg h-48 object-cover"
                    />
                  )}

                  {msg.text && <p className="mt-2">{msg.text}</p>}

                  <div className="text-xs mt-1 opacity-75 flex items-center gap-1 justify-end">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}

                    {/* ✅ STATUS */}
                    {msg.senderId === authUser._id && (
  <span className="ml-1 flex items-center">
    {msg.status === "sent" && (
      <Tick color="#9CA3AF" />
    )}

    {msg.status === "delivered" && (
      <DoubleTick color="#9CA3AF" />
    )}

    {msg.status === "seen" && (
      <DoubleTick color="#00FFFF" />
    )}
  </span>
)}
                  </div>
                </div>
              </div>
            ))}

            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />
    </>
  );
}

export default ChatContainer;