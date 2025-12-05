import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api/channels`,
  withCredentials: true,
});

export const getChannels = async () => {
  const { data } = await api.get("/");
  return data.channels || [];
};

export const createChannel = async (channelData) => {
  const { data } = await api.post("/", channelData);
  return data;
};

export const joinChannel = (channelId) => api.post(`/${channelId}/join`);
export const leaveChannel = (channelId) => api.post(`/${channelId}/leave`);
export const getChannel = (channelId) => api.get(`/${channelId}`);
