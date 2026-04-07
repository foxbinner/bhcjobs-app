import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ORIGIN } from "../constants/endpoints";

const BASE_URL = API_ORIGIN;
const TOKEN_KEY = "@bhc_token";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization =
      `Bearer ${token}`;
  }
  return config;
});

export const getIndustries = () => api.get("/api/industry/get");
export const getJobs = () => api.get("/api/job/get");
export const getJob = (id: number | string) => api.get(`/api/job/get/${id}`);
export const getCompanies = () => api.get("/api/company/get");
export const shortlistJob = (job_id: number | string) =>
  api.post("/api/job/shortlist", { job_id });

export interface RegisterPayload {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirm_password: string;
  passport_number: string;
  dob: string;
  gender: string;
}

export const register = (data: RegisterPayload) =>
  api.post("/api/job_seeker/register", data);

export const verifyPhone = (phone: string, otp: string) =>
  api.post("/api/job_seeker/phone_verify", { phone, otp });

export const login = (phone: string, password: string) =>
  api.post("/api/job_seeker/login", { phone, password });

export const forgotPassword = (phone: string) =>
  api.post("/api/job_seeker/forgot_password", { phone });

export const getProfile = () => api.get("/api/job_seeker/get");

export const removeShortlist = (job_id: number) =>
  api.post("/api/job/shortlist/remove", { job_id });

export const setAuthToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export default api;
