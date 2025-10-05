import React, { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  // ✅ Login with Email
  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Login failed");

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Register with Username, Email, Password
  const register = async (username, email, password) => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      console.log("Register response:", data);

      return res.ok && data.success === true;
    } catch (err) {
      console.error("Register error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
