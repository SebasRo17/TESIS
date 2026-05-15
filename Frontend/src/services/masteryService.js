import { api } from "./apiClient";

function toSafeNumber(value, fallback = 0) {
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
}

function clampFraction(value) {
	return Math.max(0, Math.min(1, toSafeNumber(value, 0)));
}

function masteryToPercent(value) {
	return Math.max(0, Math.min(100, Math.round(clampFraction(value) * 100)));
}

function normalizeTopicMastery(payload, topicId) {
	const raw = payload?.data ?? payload ?? {};
	const mastery = clampFraction(raw.mastery);
	return {
		topicId: toSafeNumber(raw.topicId, toSafeNumber(topicId, 0)),
		topicName: raw.topicName || "",
		mastery,
		masteryPercent: masteryToPercent(mastery),
		observations: toSafeNumber(raw.observations, 0),
		lastUpdatedAt: raw.lastUpdatedAt || null,
	};
}

function normalizeCourseMastery(payload, courseId) {
	const raw = payload?.data ?? payload ?? {};
	const topics = Array.isArray(raw.topics)
		? raw.topics.map((t) => ({
				topicId: toSafeNumber(t.topicId, 0),
				topicName: t.topicName || "",
				mastery: clampFraction(t.mastery),
				masteryPercent: masteryToPercent(t.mastery),
				observations: toSafeNumber(t.observations, 0),
				lastUpdatedAt: t.lastUpdatedAt || null,
			}))
		: [];

	const total = topics.length;
	const average =
		total > 0
			? topics.reduce((acc, t) => acc + toSafeNumber(t.mastery, 0), 0) / total
			: 0;
	const calculatedMastery = total > 0 ? clampFraction(average) : clampFraction(raw.mastery);

	return {
		courseId: toSafeNumber(raw.courseId, toSafeNumber(courseId, 0)),
		courseTitle: raw.courseTitle || "",
		topics,
		mastery: calculatedMastery,
		masteryPercent: masteryToPercent(calculatedMastery),
	};
}

function normalizeJournal(payload, topicId) {
	const raw = payload?.data ?? payload ?? {};
	const items = Array.isArray(raw.items)
		? raw.items.map((item, index) => {
				const mastery = clampFraction(
					item.mastery ?? item.value ?? item.score ?? item.percentage ?? 0
				);
				const timestamp =
					item.timestamp ||
					item.recordedAt ||
					item.createdAt ||
					item.updatedAt ||
					item.date ||
					null;

				return {
					id: item.id ?? `${topicId}-${index}`,
					mastery,
					masteryPercent: masteryToPercent(mastery),
					observations: toSafeNumber(item.observations, 0),
					timestamp,
				};
			})
		: [];

	return {
		topicId: toSafeNumber(raw.topicId, toSafeNumber(topicId, 0)),
		topicName: raw.topicName || "",
		items,
	};
}

export async function getTopicMastery(topicId) {
	const { data } = await api.get(`/me/topics/${topicId}/mastery`);
	return normalizeTopicMastery(data, topicId);
}

export async function getCourseMastery(courseId) {
	const { data } = await api.get(`/me/courses/${courseId}/mastery`);
	return normalizeCourseMastery(data, courseId);
}

export async function getTopicMasteryJournal(topicId, params = {}) {
	const query = {};
	if (params.limit != null) query.limit = params.limit;
	if (params.offset != null) query.offset = params.offset;

	const { data } = await api.get(`/me/topics/${topicId}/mastery/journal`, {
		params: query,
	});
	return normalizeJournal(data, topicId);
}

