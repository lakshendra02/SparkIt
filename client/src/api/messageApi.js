import axios from "axios";
const api = axios.create({
  baseURL: "/api/messages",
  withCredentials: true,
});

export const sendMessage = (payload) => api.post("/", payload);

export const fetchMessages = (params) => {
  const { channelId, before, limit = 30 } = params || {};
  if (!channelId) {
    return Promise.reject(new Error("channelId is required"));
  }
  return api.get(
    `/?channel=${channelId}&before=${before || ""}&limit=${limit}`
  );
};

export const editMessage = (messageId, text) =>
  api.put(`/${messageId}`, { text });

export const deleteMessage = (messageId) => api.delete(`/${messageId}`);
