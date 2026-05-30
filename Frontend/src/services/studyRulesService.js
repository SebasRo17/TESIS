import { api } from "./apiClient";

function toSafeNumber(value, fallback = 0) {
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
}

function unwrap(payload) {
	return payload?.data ?? payload ?? null;
}

function normalizeRule(rule) {
	if (!rule || typeof rule !== "object") return null;

	return {
		id: toSafeNumber(rule.id, 0),
		name: rule.name || "",
		scope: rule.scope || "",
		priority: toSafeNumber(rule.priority, 0),
		definition: rule.definition && typeof rule.definition === "object" ? rule.definition : {},
		appliedScope: rule.appliedScope || null,
		bindingId: rule.bindingId ?? null,
	};
}

function normalizeRulesList(payload) {
	const raw = unwrap(payload) ?? [];
	if (!Array.isArray(raw)) return [];
	return raw.map(normalizeRule).filter(Boolean);
}

export async function getApplicableStudyRules({ courseId, topicId, userId } = {}) {
	const params = {};
	if (courseId != null) params.courseId = courseId;
	if (topicId != null) params.topicId = topicId;
	if (userId != null) params.userId = userId;

	const { data } = await api.get("/study-rules/applicable", { params });
	return normalizeRulesList(data);
}

export async function getTopicStudyRules(topicId) {
	const { data } = await api.get(`/topics/${topicId}/study-rules`);
	return normalizeRulesList(data);
}

