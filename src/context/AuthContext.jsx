// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/auth`;

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Store accessToken and user info in state
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("accessToken") || null);
  const [user, setUser] = useState(() => {
    const savedRole = localStorage.getItem("userRole");
    const savedUsername = localStorage.getItem("username");
    if (savedRole && savedUsername) return { role: savedRole, username: savedUsername };
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Create axios instance with baseURL & withCredentials
  const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // send cookies for refresh token
  });

  // Attach Authorization header with Bearer token on requests
  axiosInstance.interceptors.request.use(
    (config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle token expiration and refresh
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and retry flag not set, try refreshing token
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url.includes("/refresh-token")
      ) {
        originalRequest._retry = true;

        try {
          const res = await axios.post(
            `${API_URL}/refresh-token`,
            {},
            { withCredentials: true }
          );

          const newAccessToken = res.data.accessToken;
          setAccessToken(newAccessToken);
          localStorage.setItem("accessToken", newAccessToken);

          // Update user state as well
          setUser({ role: res.data.role, username: res.data.username });
          localStorage.setItem("userRole", res.data.role);
          localStorage.setItem("username", res.data.username);

          // Update Authorization header and retry original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // Refresh token invalid or expired
          logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  // Login function
  const login = async (username, password) => {
    try {
      const res = await axios.post(
        `${API_URL}/login`,
        { username, password },
        { withCredentials: true }
      );

      setAccessToken(res.data.accessToken);
      setUser({ role: res.data.role, username: res.data.username });

      // Save tokens & user info in localStorage
      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("userRole", res.data.role);
      localStorage.setItem("username", res.data.username);

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      return { success: false, message };
    }
  };

// Register function
const register = async ({ name, username, password }) => {
  try {
    const response = await axios.post(
      `${API_URL}/register`,
      { name, username, password },
      { withCredentials: true }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Registration failed due to server error",
    };
  }
};




  // Logout function
  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
  };

  // On mount, attempt to refresh token to restore session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await axios.post(
          `${API_URL}/refresh-token`,
          {},
          { withCredentials: true }
        );

        setAccessToken(res.data.accessToken);
        setUser({ role: res.data.role, username: res.data.username });
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("userRole", res.data.role);
        localStorage.setItem("username", res.data.username);
      } catch {
        setAccessToken(null);
        setUser(null);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        register,
        logout,
        axiosInstance, // export axios instance for API calls with auth headers + refresh
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
