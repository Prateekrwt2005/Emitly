import { XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const isOnline = onlineUsers.includes(selectedUser._id);
  const isTyping = typingUsers.includes(selectedUser?._id);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div className="flex justify-between items-center px-6 py-3 bg-slate-900/60 backdrop-blur-md border-b border-white/10">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={selectedUser.profilePic || "/avatar.png"}
            alt={selectedUser.fullName}
            className="w-11 h-11 rounded-full object-cover"
          />

          {/* ONLINE DOT */}
          {isOnline && (
            <span className="absolute bottom-0 right-0">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400 border-2 border-black"></span>
              </span>
            </span>
          )}
        </div>

        <div>
          <h3 className="text-slate-200 font-medium text-sm">
            {selectedUser.fullName}
          </h3>

          {/* 🔥 TYPING UI */}
          {isTyping ? (
           <p className="text-cyan-400 text-xs flex items-center gap-1 leading-none">
  typing
  <span className="flex items-center gap-1 ml-1">
    <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce"></span>
    <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
    <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
  </span>
</p>
          ) : (
            <p className="text-slate-400 text-xs">
              {isOnline ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <button onClick={() => setSelectedUser(null)}>
        <XIcon className="w-5 h-5 text-slate-400 hover:text-white transition" />
      </button>
    </div>
  );
}

export default ChatHeader;