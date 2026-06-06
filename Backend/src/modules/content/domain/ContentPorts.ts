import type {
  ContentEvent,
  ContentPrerequisite,
  ContentVariant,
  LessonReference,
  UserContentAssignment,
} from './Content';

export interface CreateContentEventInput {
  userId: number;
  contentVariantId: number;
  eventType: string;
  eventValue: unknown;
}

export interface CreateContentVariantInput {
  lessonId: number;
  modality: string;
  difficultyProfile?: string;
  readingLevel?: string;
  bodyHtml: string;
  estimatedMinutes?: number;
}

export interface CreateUserContentAssignmentInput {
  userId: number;
  lessonId: number;
  contentVariantId: number;
  assignedBy: string;
  rationale?: string | null;
  status: string;
}

export interface LessonWithTopic {
  id: number;
  title: string;
  topicName: string | null;
  courseTitle: string | null;
}

export interface ContentRepository {
  findLessonReferenceById(lessonId: number): Promise<LessonReference | null>;
  findLessonWithTopic(lessonId: number): Promise<LessonWithTopic | null>;
  findActiveVariantsByLessonId(lessonId: number): Promise<ContentVariant[]>;
  findVariantById(variantId: number): Promise<ContentVariant | null>;
  createContentEvent(input: CreateContentEventInput): Promise<ContentEvent>;
  createContentVariant(input: CreateContentVariantInput): Promise<ContentVariant>;
  createUserContentAssignment(input: CreateUserContentAssignmentInput): Promise<UserContentAssignment>;
  findPrerequisitesByLessonId(lessonId: number): Promise<ContentPrerequisite[]>;
}
