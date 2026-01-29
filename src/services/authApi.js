import axios from "axios";

const authApi = axios.create({
  baseURL: "/api/auth",
});


authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* AUTH APIs */
export const registerUser = (data) =>
  authApi.post("/register", data);

export const loginUser = (data) =>
  authApi.post("/login", data);

export const googleLogin = (data) =>
  authApi.post("/google", data);

export const verifyEmailOtp = (data) =>
  authApi.post("/verify-email-otp", data);

export const resendEmailOtp = (data) =>
  authApi.post("/resend-email-otp", data);

export const forgotPassword = (data) =>
  authApi.post("/forgot-password", data);

export const resetPassword = (token, data) =>
  authApi.post(`/reset-password/${token}`, data);

export default authApi;
