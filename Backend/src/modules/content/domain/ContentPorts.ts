import type { ContentEvent, ContentPrerequisite, ContentVariant, LessonReference } from './Content';

export interface CreateContentEventInput {
  userId: number;
  contentVariantId: number;
  eventType: string;
  eventValue: unknown;
}

export interface ContentRepository {
  findLessonReferenceById(lessonId: number): Promise<LessonReference | null>;
  findActiveVariantsByLessonId(lessonId: number): Promise<ContentVariant[]>;
  findVariantById(variantId: number): Promise<ContentVariant | null>;
  createContentEvent(input: CreateContentEventInput): Promise<ContentEvent>;
  findPrerequisitesByLessonId(lessonId: number): Promise<ContentPrerequisite[]>;
}
