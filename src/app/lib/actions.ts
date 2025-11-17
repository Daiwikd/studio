'use server';

import {
  generateQuizQuestions,
  type GenerateQuizQuestionsOutput,
} from '@/ai/flows/generate-quiz-questions';
import { z } from 'zod';
import { addQuiz } from './data';
import { redirect } from 'next/navigation';
import type { Question } from './types';

const questionSchema = z.object({
  id: z.string(),
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

export const generateQuestionsSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
  numberOfQuestions: z.coerce.number().min(1).max(10),
});

export type GenerateQuestionsState = {
  questions?: Question[];
  error?: string;
};

export async function generateQuestionsAction(
  prevState: GenerateQuestionsState,
  formData: FormData
): Promise<GenerateQuestionsState> {
  const validatedFields = generateQuestionsSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.topic?.[0],
    };
  }

  try {
    const output: GenerateQuizQuestionsOutput = await generateQuizQuestions(
      validatedFields.data
    );

    const questions: Question[] = output.questions.map((q) => ({
      id: crypto.randomUUID(),
      question: q.question,
      answer: q.answer,
      options: q.options || [],
      type: q.type,
    }));

    return { questions };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate questions. Please try again.' };
  }
}

export async function createQuizAction(formData: FormData) {
  const data = JSON.parse(formData.get('data') as string);
  const validatedFields = createQuizSchema.safeParse(data);

  if (!validatedFields.success) {
    throw new Error(validatedFields.error.message);
  }

  try {
    const newQuiz = await addQuiz(validatedFields.data);
    redirect(`/quiz/${newQuiz.id}/share`);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to create the quiz. Please try again.');
  }
}
