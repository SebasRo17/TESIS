import { api } from "./apiClient";

// GET /courses/{courseId}/exams
export async function getCourseExams(courseId) {
	const { data } = await api.get(`/courses/${courseId}/exams`);
	return data?.data ?? [];
}

// GET /exams/{examId}/items
export async function getExamItems(examId) {
	const { data } = await api.get(`/exams/${examId}/items`);
	return data?.data ?? null;
}

// POST /exams/{examId}/attempts
export async function startExamAttempt(examId) {
	const { data } = await api.post(`/exams/${examId}/attempts`);
	return data?.data ?? null;
}

// POST /exam-attempts/{attemptId}/responses
export async function submitExamAttemptResponse(attemptId, payload) {
	const { data } = await api.post(`/exam-attempts/${attemptId}/responses`, payload);
	return data?.data ?? null;
}

// POST /exam-attempts/{attemptId}/finish
export async function finishExamAttempt(attemptId) {
	const { data } = await api.post(`/exam-attempts/${attemptId}/finish`);
	return data?.data ?? null;
}

// GET /exam-attempts/{attemptId}
export async function getExamAttemptDetail(attemptId) {
	const { data } = await api.get(`/exam-attempts/${attemptId}`);
	return data?.data ?? null;
}

// GET /exam-attempts/{attemptId}/review
export async function getExamAttemptReview(attemptId) {
	const { data } = await api.get(`/exam-attempts/${attemptId}/review`);
	return data?.data ?? null;
}
