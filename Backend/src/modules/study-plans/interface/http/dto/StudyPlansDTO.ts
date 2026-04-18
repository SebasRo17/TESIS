import { z } from 'zod';

export const CourseIdParamsSchema = z.object({
  courseId: z.string().regex(/^\d+$/).transform(Number),
});

export const ItemIdParamsSchema = z.object({
  itemId: z.string().regex(/^\d+$/).transform(Number),
});

export const UpdatePlanItemStatusBodySchema = z.object({
  status: z.enum(['pending', 'done', 'blocked']),
});

export const CreateStudyPlanBodySchema = z.object({
  userId: z.number().int().positive(),
  courseId: z.number().int().positive(),
  source: z.string().min(1).optional(),
  state: z.enum(['draft', 'active', 'superseded']).optional(),
  items: z
    .array(
      z.object({
        contentRefType: z.enum(['lesson', 'variant', 'item', 'topic', 'exam']),
        contentRefId: z.number().int().positive(),
        type: z.string().min(1),
        priority: z.number(),
        orderN: z.number().int().positive(),
        dueAt: z.string().datetime().optional(),
        metadata: z.unknown().optional(),
      })
    )
    .min(1),
});

export type CourseIdParams = z.infer<typeof CourseIdParamsSchema>;
export type ItemIdParams = z.infer<typeof ItemIdParamsSchema>;
export type UpdatePlanItemStatusBody = z.infer<typeof UpdatePlanItemStatusBodySchema>;
export type CreateStudyPlanBody = z.infer<typeof CreateStudyPlanBodySchema>;
