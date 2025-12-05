import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { loginUser, signupUser } from "../api/authApi";
import {
  setToken,
  getToken,
  clearToken,
  saveUser,
  getUser,
  clearUser,
} from "../utils/storage";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser());
  const [token, setAuthToken] = useState(getToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();

    if (storedToken && storedUser) {
      setAuthToken(storedToken);
      setUser(storedUser);
    }

    setLoading(false);
  }, []);

  const login = async (data) => {
    const res = await loginUser(data);

    if (res.token) {
      setToken(res.token);
      setAuthToken(res.token);
    }

    if (res.user) {
      saveUser(res.user);
      setUser(res.user);
    }

    return res;
  };

  const signup = async (data) => {
    const res = await signupUser(data);

    if (res.token) {
      setToken(res.token);
      setAuthToken(res.token);
    }

    if (res.user) {
      saveUser(res.user);
      setUser(res.user);
    }

    return res;
  };

  const logout = () => {
    clearToken();
    clearUser();
    setUser(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
