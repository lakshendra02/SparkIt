import axios from "axios";
const api = axios.create({
  baseURL: "/api/auth",
  withCredentials: true,
});

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const loginUser = async ({ email, password }) => {
  const res = await axios.post(
    `${API_URL}/api/auth/login`,
    { email, password },
    { withCredentials: true }
  );
  return res.data;
};

export const signupUser = async ({ name, email, password }) => {
  const res = await axios.post(
    `${API_URL}/api/auth/signup`,
    { name, email, password },
    { withCredentials: true }
  );
  return res.data;
};

export const me = () => api.get("/me");
export const logout = () => api.post("/logout");
