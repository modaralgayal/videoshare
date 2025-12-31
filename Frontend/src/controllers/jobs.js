import { apiClient } from "./user";
import { API_URL } from "../config/apiConfig";

export const postJob = async (job) => {
  try {
    // Use apiClient which automatically includes JWT token
    // Note: customerId is now set on backend from JWT, so we don't need to send it
    const { ...jobData } = job;
    const response = await apiClient.post(`${API_URL}/api/job`, jobData);

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

export const makeBid = async (bid) => {
  try {
    // videographerId is now set on backend from JWT, so we don't need to send it
    const { videographerId, ...bidData } = bid;
    const response = await apiClient.post(`${API_URL}/api/bid`, bidData);

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message,
        bid: response.data.bid || null,
      };
    } else {
      throw new Error(response.data.message || "Failed to submit bid");
  }
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to submit bid. Please try again.";
    throw new Error(errorMessage);
  }
};

export const fetchBidsForCustomer = async () => {
  try {
    // CustomerId is now taken from JWT token on the backend
    const response = await apiClient.get(`${API_URL}/api/bids`);

    if (response.data.success) {
      return response.data.bids || [];
    }

    throw new Error(response.data.message || "Failed to fetch bids");
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch bids. Please try again.";
    throw new Error(errorMessage);
  }
};

export const updateBidStatus = async (bidId, status) => {
  try {
    const response = await apiClient.patch(`${API_URL}/api/bids/${bidId}`, {
      status,
    });

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message,
      };
    }

    throw new Error(response.data.message || "Failed to update bid status");
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to update bid status. Please try again.";
    throw new Error(errorMessage);
  }
};

export const fetchBidsForPhotographer = async () => {
  try {
    // VideographerId is taken from JWT token on the backend
    const response = await apiClient.get(`${API_URL}/api/my-bids`);

    if (response.data.success) {
      return response.data.bids || [];
    }

    throw new Error(response.data.message || "Failed to fetch bids");
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch bids. Please try again.";
    throw new Error(errorMessage);
  }
};