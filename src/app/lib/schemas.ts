import { z } from 'zod';
import type { Question } from './types';

const questionSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1, 'Question cannot be empty.'),
  options: z.array(z.string()),
  answer: z.string().min(1, 'Answer cannot be empty.'),
  type: z.enum(['multiple_choice', 'true_false', 'short_answer']),
});

export const createQuizSchema = z.object({
  title: z.string().min(1, 'Quiz title cannot be empty.'),
  questions: z
    .array(questionSchema)
    .min(1, 'Quiz must have at least one question.'),
});
