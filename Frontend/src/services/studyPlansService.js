import { api } from "./apiClient";

// GET /me/courses/{courseId}/study-plan
export async function getActiveStudyPlan(courseId) {
	const { data } = await api.get(`/me/courses/${courseId}/study-plan`);
	return data?.data ?? null;
}

// GET /me/courses/{courseId}/study-plan/next
export async function getNextStudyPlanActivity(courseId) {
	const { data } = await api.get(`/me/courses/${courseId}/study-plan/next`);
	return data?.data ?? null;
}

// PATCH /study-plan/items/{itemId}
export async function updateStudyPlanItemStatus(itemId, status) {
	const { data } = await api.patch(`/study-plan/items/${itemId}`, { status });
	return data?.data ?? null;
}

// GET /me/courses/{courseId}/study-plans
export async function getStudyPlanHistory(courseId) {
	const { data } = await api.get(`/me/courses/${courseId}/study-plans`);
	return data?.data ?? [];
}
