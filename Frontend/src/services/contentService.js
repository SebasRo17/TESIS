import { api } from "./apiClient";

// GET /lessons/{lessonId}/content
export async function getLessonContent(lessonId) {
  const { data } = await api.get(`/lessons/${lessonId}/content`);
  return data?.data ?? [];
}

// GET /lessons/{lessonId}/content/prereqs
export async function getLessonContentPrereqs(lessonId) {
  const { data } = await api.get(`/lessons/${lessonId}/content/prereqs`);
  return data?.data ?? [];
}

// Alias explícito para prerequisitos de contenido por lección
export async function getContentPrereqsByLesson(lessonId) {
  const { data } = await api.get(`/lessons/${lessonId}/content/prereqs`);
  return data?.data ?? [];
}

// GET /content/{variantId}
export async function getContentVariant(variantId) {
  const { data } = await api.get(`/content/${variantId}`);
  return data?.data ?? null;
}

// POST /content/{variantId}/events
export async function recordContentEvent(variantId, eventData) {
  const { data } = await api.post(`/content/${variantId}/events`, eventData);
  return data;
}
