import axios from "axios";
const api = axios.create({
  baseURL: "/api/channels",
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
