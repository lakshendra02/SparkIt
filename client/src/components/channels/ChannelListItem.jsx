import React from "react";
import { Users } from "lucide-react";

const ChannelListItem = ({ channel, currentChannel, onSelectChannel }) => {
  const isSelected = currentChannel?._id === channel._id;

  return (
    <li
      className={`p-3 rounded-lg cursor-pointer transition flex justify-between items-center gap-2 
        ${
          isSelected
            ? "bg-indigo-600/40 text-indigo-100 font-medium shadow-lg border border-indigo-400/40"
            : "hover:bg-white/10 text-white/80"
        }`}
      onClick={() => onSelectChannel(channel)}
      title={channel.name}
    >
      <span className="truncate"># {channel.name}</span>
      <span
        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full 
        ${
          isSelected
            ? "bg-indigo-400/40 text-indigo-200"
            : "bg-white/10 text-white/60"
        }`}
      >
        <Users size={12} /> {channel.memberCount}
      </span>
    </li>
  );
};

export default ChannelListItem;
