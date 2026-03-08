import { z } from 'zod';

export const RuleIdParamsSchema = z.object({
  ruleId: z.string().regex(/^\d+$/).transform(Number),
});

export const TopicIdParamsSchema = z.object({
  topicId: z.string().regex(/^\d+$/).transform(Number),
});

const optionalPositiveInt = z
  .union([z.string(), z.number()])
  .transform((v) => Number(v))
  .refine((v) => Number.isInteger(v) && v > 0, { message: 'Debe ser entero positivo' })
  .optional();

export const ApplicableRulesQuerySchema = z.object({
  courseId: optionalPositiveInt,
  topicId: optionalPositiveInt,
  userId: optionalPositiveInt,
});

export type RuleIdParams = z.infer<typeof RuleIdParamsSchema>;
export type TopicIdParams = z.infer<typeof TopicIdParamsSchema>;
export type ApplicableRulesQuery = z.infer<typeof ApplicableRulesQuerySchema>;
