import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearAuthStorage,
} from "../utils/authStorage";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Cliente principal (con interceptor de auth)
export const api = axios.create({
  baseURL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

// Cliente sin interceptores (para refresh sin bucles)
const apiRaw = axios.create({
  baseURL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

async function refreshTokens() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const { data } = await apiRaw.post("/auth/refresh", { refreshToken });
  if (!data?.accessToken || !data?.refreshToken) {
    throw new Error("Respuesta de refresh inválida");
  }

  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const original = error?.config;

    // Reintento por 401 (token expirado) -> refresh
    if (status === 401 && original && !original._retry) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return Promise.reject(error);

      original._retry = true;

      try {
        refreshPromise = refreshPromise || refreshTokens();
        const newAccess = await refreshPromise;
        refreshPromise = null;

        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        refreshPromise = null;
        clearAuthStorage();
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export function getApiBaseURL() {
  return baseURL;
}
