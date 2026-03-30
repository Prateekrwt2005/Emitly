import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

// ✅ Tick Icons (UNCHANGED)
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

  // 🔥 FETCH + SOCKET SUBSCRIBE
  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser]);

  // 🔥 AUTO SCROLL
  useEffect(() => {
   messageEndRef.current?.scrollIntoView({
  behavior: "smooth",
  block: "end",
});
  }, [messages]);

  // 🔥 SEEN LOGIC (UNCHANGED)
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

      {/* 🔥 MESSAGES AREA */}
      <div className="flex-1 px-6 py-6 overflow-y-auto scroll-smooth">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto flex flex-col gap-3">
            {messages.map((msg) => {
              const isMe = msg.senderId === authUser._id;

              return (
                <div
                  key={msg._id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                   className={`relative max-w-[75%] px-4 py-2 rounded-2xl text-[15px] shadow-sm
${
  isMe
    ? " bg-cyan-700/80 text-white border border-cyan-500/50"
    : "bg-white/5 backdrop-blur-md border border-white/10 text-slate-200"
}`}
                  >
                    {/* IMAGE */}
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Shared"
                        className="rounded-lg mb-2 max-h-60 object-cover"
                      />
                    )}

                    {/* TEXT */}
                    {msg.text && (
                      <p className="leading-relaxed">{msg.text}</p>
                    )}

                    {/* TIME + STATUS */}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}

                      {isMe && (
                        <span className="ml-1 flex items-center">
                          {msg.status === "sent" && (
                            <Tick color="#cbd5f5" />
                          )}

                          {msg.status === "delivered" && (
                            <DoubleTick color="#cbd5f5" />
                          )}

                          {msg.status === "seen" && (
                            <DoubleTick color="#22d3ee" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      {/* 🔥 INPUT */}
      <MessageInput />
    </>
  );
}

export default ChatContainer;