import axios from "axios";

export const baseURL =
  process.env.REACT_APP_MODE === "PROD"
    ? "https://freelanceme-backend.onrender.com" // Production URL
    : "http://localhost:4000"; // Development URL

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});
