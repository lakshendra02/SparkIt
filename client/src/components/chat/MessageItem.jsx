import React, { useState } from "react";
import { formatTime } from "../../utils/formatDate";
import { editMessage, deleteMessage } from "../../api/messageApi";

export default function MessageItem({
  m,
  isOwn,
  onMessageUpdated,
  onMessageDeleted,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(m.text);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSave = async () => {
    if (!editText.trim()) return;
    try {
      const res = await editMessage(m._id, editText.trim());
      onMessageUpdated?.(res.data?.message || { ...m, text: editText.trim() });
      setIsEditing(false);
      setMenuOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMessage(m._id);
      onMessageDeleted?.(m._id);
      setMenuOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}>
      <div className="max-w-[75%] mb-2">
        <div
          className={`px-4 py-2 rounded-2xl shadow-lg backdrop-blur-sm ${
            isOwn
              ? "bg-indigo-600/80 text-white"
              : "bg-white/10 text-white/90 border border-white/20"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs mb-1 opacity-75">
            <span className="font-semibold break-all">
              {m.sender?.name || "Unknown"}
            </span>

            <span className="text-[11px] whitespace-nowrap">
              {formatTime(m.createdAt)}
            </span>
          </div>

          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="flex-1 px-3 py-1 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="px-2 py-1 bg-emerald-500/80 hover:bg-emerald-600 text-white rounded text-sm font-medium"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditText(m.text);
                }}
                className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="whitespace-pre-wrap leading-relaxed break-all">
              {m.text}
            </div>
          )}
        </div>

        {isOwn && !isEditing && (
          <div className="mt-1 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg shadow-sm text-xs text-white/80 font-medium"
            >
              ⋮
            </button>

            {menuOpen && (
              <div className="mt-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-xl p-1 text-sm">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-white/90 hover:bg-white/20 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-3 py-2 text-red-300 hover:bg-red-500/20 rounded"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
