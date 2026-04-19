import { api } from "./apiClient";

// GET /courses/{courseId}/lessons
export async function getLessonsByCourse(courseId) {
  const { data } = await api.get(`/courses/${courseId}/lessons`);
  return data; // [{ id, courseId, primaryTopicId, title, canonicalSlug, isActive, version }]
}

// GET /topics/{topicId}/lessons
export async function getLessonsByTopic(topicId) {
  const { data } = await api.get(`/topics/${topicId}/lessons`);
  return data;
}

// GET /lessons/{lessonId}
export async function getLessonById(lessonId) {
  const { data } = await api.get(`/lessons/${lessonId}`);
  return data;
}

// GET /lessons/{lessonId}/prereqs
export async function getLessonPrereqs(lessonId) {
  const { data } = await api.get(`/lessons/${lessonId}/prereqs`);
  return data;
}
