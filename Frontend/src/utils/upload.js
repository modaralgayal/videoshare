import { apiClient } from "../controllers/user";
import { API_URL } from "../config/apiConfig";

/**
 * Upload file through backend (bypasses CORS)
 */
export const uploadFile = async (file, onProgress) => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append("file", file);

    // Upload through backend
    const response = await apiClient.post(`${API_URL}/api/upload/file`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentComplete = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(percentComplete);
        }
      },
    });

    if (response.data.success) {
      return response.data.media;
    }

    throw new Error(response.data.message || "Failed to upload file");
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to upload file. Please try again.";
    throw new Error(errorMessage);
  }
};

