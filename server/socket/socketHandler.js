const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const Channel = require("../models/Channel");
const User = require("../models/User");

const cookieName = process.env.COOKIE_NAME || "chat_token";

module.exports = (io) => {
  const onlineMap = new Map();

  const broadcastOnline = () => {
    const list = Array.from(onlineMap.keys()).map((userId) => {
      const info = onlineMap.get(userId);
      return {
        userId,
        name: info.name,
        sockets: Array.from(info.sockets),
      };
    });
    io.emit("onlineUsers", list);
  };

  io.on("connection", async (socket) => {
    try {
      let user = null;
      try {
        const token = socket.handshake.auth?.token;
        if (token) {
          const payload = jwt.verify(token, process.env.JWT_SECRET);
          user = await User.findById(payload.id).select("name email");
        } else {
          const cookies = socket.handshake.headers?.cookie;
          if (cookies) {
            const parsed = Object.fromEntries(
              cookies.split(";").map((c) => c.trim().split("="))
            );
            if (parsed[cookieName]) {
              const payload = jwt.verify(
                parsed[cookieName],
                process.env.JWT_SECRET
              );
              user = await User.findById(payload.id).select("name email");
            }
          }
        }
      } catch (e) {
        console.warn("Socket auth failed", e.message);
      }

      if (user) {
        const id = user._id.toString();
        const existing = onlineMap.get(id) || {
          name: user.name,
          sockets: new Set(),
        };
        existing.sockets.add(socket.id);
        onlineMap.set(id, existing);

        socket.userId = id;
        socket.userName = user.name;

        broadcastOnline();
      }

      console.log(
        "Socket connected:",
        socket.id,
        "user:",
        socket.userId || "guest"
      );

      socket.on("joinChannel", async (channelId) => {
        try {
          if (!channelId) return;
          socket.join(channelId);
        } catch (err) {
          console.error("joinChannel error", err);
        }
      });

      socket.on("leaveChannel", async (channelId) => {
        try {
          socket.leave(channelId);
        } catch (err) {
          console.error("leave error", err);
        }
      });
      socket.on("userTyping", ({ userId, username, channelId }) => {
        if (!channelId) return;
        socket.to(channelId).emit("userTyping", {
          userId: userId || socket.userId,
          username: username || socket.userName,
          channelId,
        });
      });

      socket.on("userStopTyping", ({ userId, channelId }) => {
        if (!channelId) return;
        socket.to(channelId).emit("userStopTyping", {
          userId: userId || socket.userId,
          channelId,
        });
      });

      // When client emits 'newMessage' via socket
      socket.on("newMessage", async (payload) => {
        try {
          if (!payload || !payload.channel || !payload.text) return;

          const senderId = socket.userId;
          if (!senderId) {
            return;
          }

          const msg = new Message({
            sender: senderId,
            channel: payload.channel,
            text: payload.text,
          });
          await msg.save();
          await msg.populate("sender", "name email");

          io.to(payload.channel).emit("message", {
            _id: msg._id,
            sender: msg.sender,
            channel: payload.channel,
            text: msg.text,
            createdAt: msg.createdAt,
          });
        } catch (err) {
          console.error("newMessage error", err);
        }
      });

      socket.on("disconnect", () => {
        try {
          if (socket.userId) {
            const id = socket.userId;
            const info = onlineMap.get(id);
            if (info) {
              info.sockets.delete(socket.id);
              if (info.sockets.size === 0) {
                onlineMap.delete(id);
              } else {
                onlineMap.set(id, info);
              }
            }
            broadcastOnline();
          }
          console.log("Socket disconnected:", socket.id);
        } catch (e) {
          console.error("disconnect error", e);
        }
      });
    } catch (err) {
      console.error("socket connection handler error", err);
    }
  });
};
