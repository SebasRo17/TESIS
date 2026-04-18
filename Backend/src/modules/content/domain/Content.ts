export interface ContentVariant {
  id: number;
  lessonId: number;
  modality: string;
  difficultyProfile: string | null;
  readingLevel: string | null;
  contentUrl: string | null;
  bodyHtml: string | null;
  estimatedMinutes: number | null;
  isActive: boolean;
  version: number;
}

export interface ContentEvent {
  id: number;
  userId: number;
  lessonId: number | null;
  contentVariantId: number;
  eventType: string;
  eventValue: unknown;
}

export interface ContentPrerequisite {
  id: number;
  lessonId: number;
  requiredTopicId: number;
  minMastery: number;
  topicName: string | null;
}

export interface LessonReference {
  id: number;
  isActive: boolean;
}
