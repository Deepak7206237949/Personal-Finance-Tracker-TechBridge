import React, { createContext, useEffect, useState, useCallback, useMemo } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const AUTH_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || "pf_access_token";
  const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY || "pf_refresh_token";

  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("pf_user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("pf_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("pf_user");
    }
  }, [user]);

  // LOGIN FUNCTION
  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { accessToken, refreshToken, user } = res.data;

      localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      setUser(user);

      return user;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  }, []);

  // LOGOUT FUNCTION
  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.warn("Logout request failed:", error.response?.data || error.message);
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem("pf_user");
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isReadOnly: user?.role?.toLowerCase() === "read-only"
    }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
