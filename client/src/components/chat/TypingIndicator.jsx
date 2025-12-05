import React, { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

export default function TypingIndicator({ channelId }) {
  const socket = useSocket();
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (!socket || !channelId) return;

    const onTyping = ({ userId, username, channelId: chId }) => {
      if (chId !== channelId || userId === user?._id) return;
      setTypingUsers((prev) =>
        prev.some((u) => u.userId === userId)
          ? prev
          : [...prev, { userId, username }]
      );
    };

    const onStop = ({ userId, channelId: chId }) => {
      if (chId !== channelId) return;
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    };

    socket.on("userTyping", onTyping);
    socket.on("userStopTyping", onStop);

    return () => {
      socket.off("userTyping", onTyping);
      socket.off("userStopTyping", onStop);
    };
  }, [socket, channelId, user]);

  if (!typingUsers.length) return null;

  const names = typingUsers.map((u) => u.username).join(", ");
  return (
    <div className="px-4 py-2 text-sm italic text-white/60">
      {names} typing…
    </div>
  );
}
