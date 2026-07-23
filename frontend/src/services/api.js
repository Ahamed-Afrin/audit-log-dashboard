import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://audit-log-dashboard-backend.onrender.com/api/";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ---------------- Response interceptor ----------------
// Normalizes error messages so components can show something useful
// regardless of whether the failure came from the network, a 4xx, or a 5xx.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred. Please try again.";
    return Promise.reject(new Error(message));
  }
);

/**
 * Fetches logs with search, filters, sorting and pagination.
 * @param {Object} params - query params (search, role, severity, status, region, resourceType, sortBy, order, page, limit)
 */
export const fetchLogs = async (params = {}) => {
  const response = await api.get("/logs", { params });
  return response.data;
};

/**
 * Fetches a single log by ID.
 */
export const fetchLogById = async (id) => {
  const response = await api.get(`/logs/${id}`);
  return response.data;
};

/**
 * Deletes a log by ID.
 */
export const deleteLogById = async (id) => {
  const response = await api.delete(`/logs/${id}`);
  return response.data;
};

/**
 * Uploads an array of log objects in bulk.
 * @param {Array} logs
 * @param {Function} onUploadProgress - optional progress callback (0-100)
 */
export const bulkUploadLogs = async (logs, onUploadProgress) => {
  const response = await api.post("/logs/bulk-upload", logs, {
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percent);
      }
    },
  });
  return response.data;
};

/**
 * Fetches aggregate dashboard statistics.
 */
export const fetchDashboardStats = async () => {
  const response = await api.get("/logs/stats/summary");
  return response.data;
};

export default api;
