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

function randomId() {
  return Math.random().toString(36).substring(2, 9);
}

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
      id: randomId(), // Add a temporary client-side ID
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

  // Re-construct question objects to ensure only expected properties are used,
  // and assign new, secure UUIDs.
  const questionsWithServerIds: Question[] = quizData.questions.map(q => ({
    id: randomUUID(), // Assign a new, secure UUID on the server
    question: q.question,
    answer: q.answer,
    options: q.options,
    type: q.type,
  }));

  const finalQuizData = {
    title: quizData.title,
    questions: questionsWithServerIds,
  };

  try {
    const newQuiz = await addQuiz(finalQuizData);
    redirect(`/quiz/${newQuiz.id}/share`);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to create the quiz. Please try again.');
  }
}
