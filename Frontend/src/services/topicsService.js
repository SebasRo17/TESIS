// src/services/topicsService.js
import { api } from "./apiClient";

export async function getCourseTopicsTree(courseId) {
  const { data } = await api.get(`/courses/${courseId}/topics/tree`);
  // Backend: { success: true, data: [...] }
  return data?.data ?? [];
}

export async function getCourseTopicsFlat(courseId) {
  const { data } = await api.get(`/courses/${courseId}/topics`);
  return data?.data ?? [];
}

export async function getTopicById(topicId) {
  const { data } = await api.get(`/topics/${topicId}`);
  // Backend: { success: true, data: {...} }
  return data?.data ?? null;
}
