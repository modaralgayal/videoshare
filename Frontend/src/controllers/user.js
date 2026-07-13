import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../config/firebaseConfig";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

// Get stored JWT token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Get stored user data
export const getUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// Clear authentication data
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  const user = getUser();
  return !!(token && user);
};

// Create axios instance with auth token
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid, clear storage
      logout();
      // Optionally redirect to login page
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

export const connectToBackend = async () => {
  let response;
  try {
    response = await axios.get(`${API_BASE_URL}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Google sign-in via Firebase popup
export const googleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  provider.addScope("openid");
  provider.addScope("email");
  provider.addScope("profile");

  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const idToken = await user.getIdToken();
  return { user, idToken };
};

// Authenticate with backend and get JWT token
export const authenticateWithBackend = async (idToken, userType) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/google`, {
      idToken,
      userType,
    });

    if (response.data.token) {
      // Store JWT token and user data
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    console.error("Backend Authentication Error:", error);
    throw error.response?.data || error.message;
  }
};
