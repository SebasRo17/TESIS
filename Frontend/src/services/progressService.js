import { api } from "./apiClient";

function unwrap(payload) {
	return payload?.data ?? payload ?? null;
}

export async function getCourseProgress(courseId) {
	const { data } = await api.get(`/me/courses/${courseId}/progress`);
	return unwrap(data);
}

export async function getLessonProgress(lessonId) {
	const { data } = await api.get(`/lessons/${lessonId}/progress`);
	return unwrap(data);
}

export async function startLessonProgress(lessonId) {
	const { data } = await api.post(`/lessons/${lessonId}/progress/start`);
	return unwrap(data);
}

export async function updateLessonProgress(lessonId, payload = {}) {
	const { data } = await api.post(`/lessons/${lessonId}/progress/update`, payload);
	return unwrap(data);
}

export async function completeLessonProgress(lessonId) {
	const { data } = await api.post(`/lessons/${lessonId}/progress/complete`);
	return unwrap(data);
}

export async function getRecentProgress() {
	const { data } = await api.get("/me/progress/recent");
	return unwrap(data);
}
