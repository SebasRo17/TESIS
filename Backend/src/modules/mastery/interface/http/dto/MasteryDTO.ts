import { z } from 'zod';

export const TopicIdParamsSchema = z.object({
  topicId: z.string().regex(/^\d+$/).transform(Number),
});

export const CourseIdParamsSchema = z.object({
  courseId: z.string().regex(/^\d+$/).transform(Number),
});

export const MasteryJournalQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export const UpdateMasteryBodySchema = z.object({
  userId: z.number().int().positive(),
  topicId: z.number().int().positive(),
  source: z.enum(['exam', 'response', 'manual', 'orchestrator']),
  delta: z.number().min(-1).max(1),
  evidence: z.unknown().optional(),
  observationsDelta: z.number().int().min(0).optional(),
});

export type TopicIdParams = z.infer<typeof TopicIdParamsSchema>;
export type CourseIdParams = z.infer<typeof CourseIdParamsSchema>;
export type MasteryJournalQuery = z.infer<typeof MasteryJournalQuerySchema>;
export type UpdateMasteryBody = z.infer<typeof UpdateMasteryBodySchema>;
