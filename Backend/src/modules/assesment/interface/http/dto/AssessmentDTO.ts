import { z } from 'zod';

/**
 * DTO para obtener exámenes por curso
 */
export const GetExamsByCourseParamsSchema = z.object({
  courseId: z.string().regex(/^\d+$/).transform(Number),
});

export type GetExamsByCourseParams = z.infer<typeof GetExamsByCourseParamsSchema>;

/**
 * DTO para obtener ítems públicos de un examen
 */
export const GetExamItemsParamsSchema = z.object({
  examId: z.string().regex(/^\d+$/).transform(Number),
});

export type GetExamItemsParams = z.infer<typeof GetExamItemsParamsSchema>;

/**
 * DTO para iniciar intento de examen
 */
export const StartExamAttemptParamsSchema = z.object({
  examId: z.string().regex(/^\d+$/).transform(Number),
});

export type StartExamAttemptParams = z.infer<typeof StartExamAttemptParamsSchema>;

/**
 * DTO para registrar respuesta a ítem
 */
export const SubmitItemResponseParamsSchema = z.object({
  attemptId: z.string().regex(/^\d+$/).transform(Number),
});

export const SubmitItemResponseBodySchema = z.object({
  itemId: z.number().int().positive(),
  answer: z.any(), // Puede ser string, array, etc.
  timeSpentSec: z.number().int().nonnegative().optional(),
  hintsUsed: z.number().int().nonnegative().optional(),
});

export type SubmitItemResponseParams = z.infer<typeof SubmitItemResponseParamsSchema>;
export type SubmitItemResponseBody = z.infer<typeof SubmitItemResponseBodySchema>;

/**
 * DTO para finalizar intento
 */
export const FinishExamAttemptParamsSchema = z.object({
  attemptId: z.string().regex(/^\d+$/).transform(Number),
});

export type FinishExamAttemptParams = z.infer<typeof FinishExamAttemptParamsSchema>;

/**
 * DTO para obtener detalle de intento
 */
export const GetExamAttemptDetailParamsSchema = z.object({
  attemptId: z.string().regex(/^\d+$/).transform(Number),
});

export type GetExamAttemptDetailParams = z.infer<typeof GetExamAttemptDetailParamsSchema>;

/**
 * DTOs de respuesta
 */
export interface ExamDTO {
  id: number;
  title: string;
  mode: string;
  timeLimitSec: number;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExamItemOptionDTO {
  id: string;
  text: string;
}

export interface ExamItemDTO {
  id: number;
  topicId: number;
  type: string;
  stem: string;
  options: ExamItemOptionDTO[] | null;
  difficulty: number;
  orderN: number;
  weight: number;
}

export interface ExamWithItemsDTO {
  id: number;
  title: string;
  mode: string;
  timeLimitSec: number;
  version: number;
  items: ExamItemDTO[];
}

export interface ExamAttemptDTO {
  id: number;
  userId: number;
  examId: number;
  startedAt: string;
  completedAt: string | null;
  durationSec: number | null;
  scoreRaw: number | null;
  scoreNorm: number | null;
  metadata: any;
}

export interface ItemResponseDTO {
  id: number;
  attemptId: number;
  itemId: number;
  answer: any;
  isCorrect: boolean | null;
  timeSpentSec: number | null;
  hintsUsed: number;
  awardedScore: number | null;
  createdAt: string;
}

export interface ExamAttemptDetailDTO extends ExamAttemptDTO {
  exam: {
    id: number;
    title: string;
    mode: string;
  };
  responses: ItemResponseDTO[];
}
