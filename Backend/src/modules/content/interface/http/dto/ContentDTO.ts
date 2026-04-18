import { z } from 'zod';

export const LessonIdParamsSchema = z.object({
  lessonId: z.string().regex(/^\d+$/).transform(Number),
});

export const VariantIdParamsSchema = z.object({
  variantId: z.string().regex(/^\d+$/).transform(Number),
});

export const RegisterContentEventBodySchema = z.object({
  eventType: z.enum(['open', 'progress', 'interaction']),
  metadata: z.unknown().optional(),
});

export type LessonIdParams = z.infer<typeof LessonIdParamsSchema>;
export type VariantIdParams = z.infer<typeof VariantIdParamsSchema>;
export type RegisterContentEventBody = z.infer<typeof RegisterContentEventBodySchema>;
