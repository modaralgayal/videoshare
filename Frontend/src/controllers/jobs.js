import { apiClient } from "./user";
import { API_URL } from "../config/apiConfig";

export const postJob = async (job) => {
  try {
    // Use apiClient which automatically includes JWT token
    const response = await apiClient.post(`${API_URL}/api/job`, job);

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message,
        job: response.data.job,
      };
    } else {
      throw new Error(response.data.message || "Failed to submit form");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to post job. Please try again.";
    throw new Error(errorMessage);
  }
};

export const fetchJobs = async () => {
  try {
    const response = await apiClient.get(`${API_URL}/api/jobs`);

    if (response.data.success) {
      return response.data.jobs || [];
    }

    throw new Error(response.data.message || "Failed to fetch jobs");
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch jobs. Please try again.";
    throw new Error(errorMessage);
  }
};
