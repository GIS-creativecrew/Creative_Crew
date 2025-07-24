import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../utils/baseurl";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("jwtToken") || null);

  // Fetch user profile if token exists (on mount or token change)
  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await axios.get(`${BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data);
        } catch {
          setUser(null);
          setToken(null);
          localStorage.removeItem("jwtToken");
        }
      } else {
        setUser(null);
      }
    };
    fetchProfile();
  }, [token]);

  // Persist token in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("jwtToken", token);
    } else {
      localStorage.removeItem("jwtToken");
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);