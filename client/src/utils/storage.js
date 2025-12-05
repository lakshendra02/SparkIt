const TOKEN_KEY = "chatapp_token";
const USER_KEY = "chatapp_user";

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const saveUser = (user) => {
  if (!user) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = () => {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch (e) {
    console.warn("Failed to parse user from localStorage", e);
    localStorage.removeItem(USER_KEY); // clean invalid value
    return null;
  }
};

export const clearUser = () => {
  localStorage.removeItem(USER_KEY);
};
