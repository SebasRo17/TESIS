import { api } from "./apiClient";

export async function loginRequest(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function registerRequest(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function meRequest() {
  const { data } = await api.get("/users/me");
  return data;
}

export async function logoutRequest({ refreshToken, logoutAll = false } = {}) {
  const { data } = await api.post("/auth/logout", {
    refreshToken: refreshToken ?? null,
    logoutAll,
  });
  return data;
}

export async function forgotPasswordRequest(email) {
  const { data } = await api.post("/auth/password/forgot", { email });
  return data;
}

export async function resetPasswordRequest({ userId, token, newPassword, confirmPassword }) {
  const { data } = await api.post("/auth/password/reset", {
    userId,
    token,
    newPassword,
    confirmPassword,
  });
  return data;
}

export async function verifyEmailRequest({ userId, token }) {
  const { data } = await api.get("/auth/verify-email", {
    params: { uid: userId, token },
  });
  return data;
}
