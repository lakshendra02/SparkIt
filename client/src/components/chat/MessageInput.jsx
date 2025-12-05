import React, { useRef, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

const TYPING_TIMEOUT = 2000;

export default function MessageInput({ channelId }) {
  const [text, setText] = useState("");
  const typingTimer = useRef(null);
  const isTyping = useRef(false);
  const socket = useSocket();
  const { user } = useAuth();

  const notifyTyping = () => {
    if (!socket || !user) return;

    if (!isTyping.current) {
      isTyping.current = true;
      socket.emit("userTyping", {
        userId: user._id,
        username: user.name || user.username,
        channelId,
      });
    }

    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      isTyping.current = false;
      socket.emit("userStopTyping", { userId: user._id, channelId });
    }, TYPING_TIMEOUT);
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (!text.trim() || !channelId || !socket) return;

    const messageText = text.trim();
    setText(""); // Clear immediately so UI responds instantly

    try {
      socket.emit("newMessage", {
        channel: channelId,
        text: messageText,
      });

      socket.emit("userStopTyping", { userId: user._id, channelId });
      isTyping.current = false;
    } catch (err) {
      console.error("send message error", err);
      setText(messageText);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 py-3">
      <input
        type="text"
        placeholder="Type your message..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          notifyTyping();
        }}
        className="flex-1 px-4 py-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all shadow-lg"
      >
        Send
      </button>
    </form>
  );
}
