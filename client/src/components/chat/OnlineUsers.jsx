import React from "react";

export default function OnlineUsers({ onlineUsers }) {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-semibold text-white mb-3">Online Users</h3>

      <div className="flex-1 overflow-auto space-y-3">
        {onlineUsers?.length ? (
          onlineUsers.map((u) => (
            <div
              key={u.userId}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition"
            >
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-lg" />
              <div>
                <div className="text-sm font-medium text-white">{u.name}</div>
                <div className="text-xs text-white/60">
                  {u.status || "Online"}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-white/50">No one online</div>
        )}
      </div>
    </div>
  );
}
