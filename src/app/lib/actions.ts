'use server';

import {
  generateQuizQuestions,
  type GenerateQuizQuestionsOutput,
} from '@/ai/flows/generate-quiz-questions';
import { addQuiz } from './data';
import { redirect } from 'next/navigation';
import type { Question } from './types';
import { createQuizSchema, generateQuestionsSchema, type GenerateQuestionsState } from './schemas';
import { randomUUID } from 'crypto';

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
      id: randomUUID(),
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
  
  const quizData = validatedFields.data;
  quizData.questions = quizData.questions.map(q => ({
    ...q,
    id: randomUUID(),
  }));

  try {
    const newQuiz = await addQuiz(quizData);
    redirect(`/quiz/${newQuiz.id}/share`);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to create the quiz. Please try again.');
  }
}
