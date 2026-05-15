import { api } from "./apiClient";

export async function getCourseProgress(courseId) {
	const { data } = await api.get(`/me/courses/${courseId}/progress`);
	return data?.data ?? null;
}
