import { apiClient } from "./user";
import { API_URL } from "../config/apiConfig";

export const savePortfolio = async (description, items = []) => {
  try {
    const response = await apiClient.put(`${API_URL}/api/portfolio`, {
      description,
      items,
    });

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message,
        portfolio: response.data.portfolio,
      };
    }

    throw new Error(response.data.message || "Failed to save portfolio");
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to save portfolio. Please try again.";
    throw new Error(errorMessage);
  }
};

export const fetchPhotographerPortfolio = async (photographerId) => {
  try {
    const response = await apiClient.get(`${API_URL}/api/portfolio/${photographerId}`);

    if (response.data.success) {
      return response.data.portfolio;
    }

    throw new Error(response.data.message || "Failed to fetch portfolio");
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch portfolio. Please try again.";
    throw new Error(errorMessage);
  }
};

export const getProfilePicture = async () => {
  try {
    const response = await apiClient.get(`${API_URL}/api/profile-picture`);

    if (response.data.success) {
      return response.data.profilePicture || "";
    }

    throw new Error(response.data.message || "Failed to fetch profile picture");
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch profile picture. Please try again.";
    throw new Error(errorMessage);
  }
};

export const updateProfilePicture = async (profilePictureUrl) => {
  try {
    const response = await apiClient.put(`${API_URL}/api/profile-picture`, {
      profilePicture: profilePictureUrl,
    });

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message,
        profilePicture: response.data.profilePicture,
      };
    }

    throw new Error(response.data.message || "Failed to update profile picture");
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to update profile picture. Please try again.";
    throw new Error(errorMessage);
  }
};
