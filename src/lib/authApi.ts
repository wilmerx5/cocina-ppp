// src/lib/authApi.ts
import axios from "axios";
import { authService } from "../services/authService";



const authApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

authApi.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    console.log(error)

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await authService.refreshToken();
        return authApi(originalRequest); 
      } catch (err) {
        console.log("Refresh failed, redirecting to login"); 
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default authApi;
