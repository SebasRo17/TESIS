import { z } from 'zod';

export const UserIdParamsSchema = z.object({
  userId: z.string().regex(/^\d+$/).transform(Number),
});

export const SnapshotQuerySchema = z.object({
  courseId: z.string().regex(/^\d+$/).transform(Number),
});

export const DecisionHistoryQuerySchema = z.object({
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional(),
});

export const DecideBodySchema = z.object({
  courseId: z.number().int().positive(),
});

export const RegisterDecisionBodySchema = z.object({
  userId: z.number().int().positive(),
  decisionType: z.enum(['next', 'reinforce_topic', 'generate_content', 'update_plan', 'feedback']),
  inputSnapshot: z.unknown(),
  output: z.unknown(),
  rationale: z.string().optional(),
  modelVersion: z.string().optional(),
  correlationId: z.string().optional(),
});

export type UserIdParams = z.infer<typeof UserIdParamsSchema>;
export type SnapshotQuery = z.infer<typeof SnapshotQuerySchema>;
export type DecisionHistoryQuery = z.infer<typeof DecisionHistoryQuerySchema>;
export type DecideBody = z.infer<typeof DecideBodySchema>;
export type RegisterDecisionBody = z.infer<typeof RegisterDecisionBodySchema>;
