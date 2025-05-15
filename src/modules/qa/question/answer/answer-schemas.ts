import { z } from 'zod';

export const answerIdSchema = z.object({
  answerId: z.string().uuid(),
});

export const createAnswerSchema = z.object({
  content: z.string(),
  trainerId: z.string().uuid(),
});

export type AnswerIdSchema = z.infer<typeof answerIdSchema>;
export type CreateAnswerSchema = z.infer<typeof createAnswerSchema>;
