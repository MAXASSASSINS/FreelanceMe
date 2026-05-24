import axios from "axios";

export const baseURL =
  import.meta.env.VITE_MODE === "PROD"
    ? "https://freelanceme-backend.onrender.com" // Production URL
    : "http://localhost:4000"; // Development URL

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});
