import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fakeWait = (ms = 800) => new Promise(r => setTimeout(r, ms));

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      await fakeWait();
      if (!email || !password) return false;
      setUser({ id: "1", name: email.split("@")[0], email });
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      await fakeWait();
      if (!name || !email || !password) return false;
      setUser({ id: "1", name, email });
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => setUser(null);

  const value = { user, isLoading, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
