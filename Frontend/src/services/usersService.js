import { api } from "./apiClient";

export async function getMyProfileRequest() {
  const { data } = await api.get("/users/me");
  return data;
}

export async function updateMyProfileRequest(payload) {
  const { data } = await api.patch("/users/me", payload);
  return data;
}

export async function changeMyPasswordRequest(payload) {
  const { data } = await api.patch("/users/me/password", payload);
  return data;
}
