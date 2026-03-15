import axios from "axios";

const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  environment: import.meta.env.VITE_ENV || "development",
} as const;

export const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeout,
  headers: {
    "Content-Type": "application/json",
  },
});

export { config };
