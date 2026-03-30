import { useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { sendMessage, isSoundEnabled } = useChatStore();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    if (isSoundEnabled) playRandomKeyStrokeSound();

    sendMessage({
      text: text.trim(),
      image: imagePreview,
    });

    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTyping = () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = useChatStore.getState();

    if (!selectedUser) return;

    socket.emit("typing", { receiverId: selectedUser._id });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
  socket.emit("stopTyping", { receiverId: selectedUser._id });
}, 800);
  };

  return (
    <div className="p-4 border-t border-white/10">
      {/* IMAGE PREVIEW */}
      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-white/10"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/70 backdrop-blur flex items-center justify-center text-white hover:bg-black"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* INPUT BAR */}
      <form
        onSubmit={handleSendMessage}
        className="max-w-3xl mx-auto"
      >
        <div className="flex items-center gap-2 px-4 py-3 rounded-full
          bg-white/5 backdrop-blur-md border border-white/10
          focus-within:border-cyan-500/50 transition-all"
        >
          {/* TEXT INPUT */}
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              isSoundEnabled && playRandomKeyStrokeSound();
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 bg-transparent outline-none text-ml text-slate-200 placeholder:text-slate-400"
          />

          {/* IMAGE BUTTON */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-full transition ${
              imagePreview
                ? "text-cyan-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ImageIcon className="w-6 h-6" />
          </button>

          {/* SEND BUTTON */}
          <button
            type="submit"
            disabled={!text.trim() && !imagePreview}
            className="p-2 rounded-full bg-cyan-600 hover:bg-cyan-700
            text-white transition disabled:opacity-50"
          >
            <SendIcon className="w-6 h-6" />
          </button>

          {/* HIDDEN FILE INPUT */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </form>
    </div>
  );
}

export default MessageInput;