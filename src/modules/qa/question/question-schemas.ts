import { z } from 'zod';

export const questionIdSchema = z.object({
  questionId: z.string().uuid(),
});

export type QuestionIdSchema = z.infer<typeof questionIdSchema>;
