import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import ChannelListItem from "./ChannelListItem";
import { getChannels, createChannel } from "../../api/channelApi";

export default function ChannelList({ onSelectChannel, activeChannel }) {
  const { user } = useAuth();
  const socket = useSocket();

  const [channels, setChannels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    (async function load() {
      try {
        const data = await getChannels();
        const list = Array.isArray(data) ? data : [];
        setChannels(list);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [activeChannel, onSelectChannel]);

  useEffect(() => {
    if (!socket) return;

    const handler = (updated) => {
      try {
        setChannels((prev) => {
          const idx = prev.findIndex((c) => c._id === updated._id);
          if (idx === -1) return prev;
          const copy = [...prev];
          copy[idx] = { ...copy[idx], ...updated };
          return copy;
        });
      } catch (e) {
        console.error("channel update handler error", e);
      }
    };

    socket.on("channelUpdated", handler);
    return () => socket.off("channelUpdated", handler);
  }, [socket]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const channel = await createChannel({
        name: newName.trim(),
        createdBy: user._id,
      });
      setChannels((p) => [...p, channel]);
      setShowModal(false);
      setNewName("");
      onSelectChannel(channel);
      if (socket) socket.emit("newChannel", channel);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/20">
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/30 text-indigo-300 hover:bg-indigo-500/50 transition shadow-md"
          aria-label="Create channel"
        >
          +
        </button>
      </div>

      <nav className="flex-1 overflow-auto px-2 py-3 space-y-2">
        {channels.length === 0 ? (
          <div className="text-sm text-white/50 px-3">No channels yet</div>
        ) : (
          channels.map((ch) => (
            <ChannelListItem
              key={ch._id}
              channel={ch}
              currentChannel={activeChannel}
              onSelectChannel={onSelectChannel}
            />
          ))
        )}
      </nav>

      {showModal && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-80 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
            <h3 className="text-sm font-semibold text-white mb-4">
              Create Channel
            </h3>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Channel name"
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all shadow-md"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
