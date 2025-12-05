import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import ChannelList from "../components/channels/ChannelList";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";
import TypingIndicator from "../components/chat/TypingIndicator";
import OnlineUsers from "../components/chat/OnlineUsers";

import { getChannel, joinChannel, leaveChannel } from "../api/channelApi";

export default function ChatPage() {
  const socket = useSocket();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeChannel, setActiveChannel] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!socket) return;
    socket.on("onlineUsers", (users) => setOnlineUsers(users || []));
    return () => socket.off("onlineUsers");
  }, [socket]);

  useEffect(() => {
    (async () => {
      try {
        const id = localStorage.getItem("chatapp_active_channel");
        if (id && !activeChannel) {
          const res = await getChannel(id);
          setActiveChannel(res.data?.channel || null);
        }
      } catch (e) {
        console.warn("Failed to restore active channel", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!socket) return;
    if (!activeChannel) return;

    socket.emit("joinChannel", activeChannel._id);
    return () => {
      if (socket && activeChannel)
        socket.emit("leaveChannel", activeChannel._id);
    };
  }, [socket, activeChannel]);

  const handleSelectChannel = async (ch) => {
    try {
      // ch might be an object
      const id = ch && ch._id ? ch._id : ch;
      const res = await getChannel(id);
      const channel = res.data?.channel || null;
      setActiveChannel(channel);
      if (channel) localStorage.setItem("chatapp_active_channel", channel._id);
    } catch (err) {
      console.error("Failed to load channel:", err);
    }
  };

  const handleJoin = async () => {
    if (!activeChannel) return;
    try {
      await joinChannel(activeChannel._id);
      const res = await getChannel(activeChannel._id);
      const updated = res.data?.channel || activeChannel;
      setActiveChannel(updated);
      if (socket && updated) socket.emit("channelUpdated", updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeave = async () => {
    if (!activeChannel) return;
    try {
      await leaveChannel(activeChannel._id);
      const res = await getChannel(activeChannel._id);
      const updated = res.data?.channel || activeChannel;
      setActiveChannel(updated);
      if (socket && updated) socket.emit("channelUpdated", updated);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen flex bg-linear-to-br from-slate-900 via-indigo-900 to-slate-800 text-slate-50">
      <aside className="w-72 bg-white/10 backdrop-blur-lg border-r border-white/20 shadow-lg">
        <ChannelList
          onSelectChannel={handleSelectChannel}
          activeChannel={activeChannel}
        />
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-16 px-6 bg-white/10 backdrop-blur-lg border-b border-white/20 flex items-center justify-between shadow-lg">
          <div>
            <h1 className="text-lg font-bold text-white">
              {activeChannel ? activeChannel.name : "Select a channel"}
            </h1>
            {activeChannel && (
              <div className="text-xs text-white/60">
                {Array.isArray(activeChannel.members) &&
                activeChannel.members.length > 0
                  ? activeChannel.members
                      .slice(0, 5)
                      .map((m) => m.name)
                      .join(", ") +
                    (activeChannel.members.length > 5
                      ? ` +${activeChannel.members.length - 5}`
                      : "")
                  : `${activeChannel.memberCount || 0} members`}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeChannel &&
              activeChannel.members &&
              (activeChannel.members.some(
                (m) => String(m._id) === String(user?._id)
              ) ? (
                <button
                  onClick={handleLeave}
                  className="px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-600 text-white text-sm font-medium transition-all shadow-md"
                >
                  Leave
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/80 hover:bg-emerald-600 text-white text-sm font-medium transition-all shadow-md"
                >
                  Join
                </button>
              ))}
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all shadow-md"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-hidden p-6">
              <div className="h-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto">
                  <MessageList
                    channelId={activeChannel?._id}
                    user={user}
                    socket={socket}
                  />
                </div>

                <div className="px-4 border-t border-white/20">
                  {activeChannel && (
                    <TypingIndicator channelId={activeChannel._id} />
                  )}
                  {activeChannel && (
                    <MessageInput channelId={activeChannel._id} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="w-64 border-l border-white/20 p-4 bg-white/5 backdrop-blur-sm">
            <OnlineUsers
              onlineUsers={onlineUsers.filter(
                (u) => String(u.userId) !== String(user?._id)
              )}
            />
          </aside>
        </section>
      </main>
    </div>
  );
}
