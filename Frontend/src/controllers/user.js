import axios from "axios";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
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

export const googleSignIn = () => {
  return new Promise((resolve, reject) => {
    // Wait for GIS library to load
    const tryInit = () => {
      if (!window.google?.accounts?.oauth2) {
        setTimeout(tryInit, 100);
        return;
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: "233139786180-9rhjoqiqdguc9phtg03kigmd6kmclahl.apps.googleusercontent.com",
        scope: "openid email profile",
        callback: async (response) => {
          try {
            const credential = GoogleAuthProvider.credential(response.id_token);
            const result = await signInWithCredential(auth, credential);
            const user = result.user;
            const idToken = await user.getIdToken();
            resolve({ user, idToken });
          } catch (error) {
            console.error("Google Sign-In Credential Error:", error);
            reject(error);
          }
        },
        error_callback: (error) => {
          console.error("Google Sign-In GIS Error:", error);
          reject(error);
        }
      });

      client.requestAccessToken();
    };

    tryInit();
  });
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
