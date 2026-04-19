import { api } from "./apiClient";

export async function getCoursesRequest() {
  const { data } = await api.get("/courses");
  return data; // [{ id, code, title, description, status }]
}

export async function getCourseByIdRequest(id) {
  const { data } = await api.get(`/courses/${id}`);
  return data;
}

export async function getCourseBySlugRequest(slug) {
  const { data } = await api.get(`/courses/slug/${slug}`);
  return data;
}