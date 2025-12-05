import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const api = axios.create({
  baseURL: `${API_URL}/api/messages`,
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
