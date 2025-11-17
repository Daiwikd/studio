'use server';

import {
  generateQuizQuestions,
  type GenerateQuizQuestionsOutput,
} from '@/ai/flows/generate-quiz-questions';
import { redirect } from 'next/navigation';
import type { Question } from './types';
import { createQuizSchema, generateQuestionsSchema, type GenerateQuestionsState } from './schemas';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDB } from '@/firebase/admin';

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

  // Re-construct question objects to ensure only expected properties are used.
  // The ID from the client is discarded.
  const questionsWithServerIds: Omit<Question, 'id'>[] = quizData.questions.map(q => ({
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
    const db = getAdminDB();
    const collectionRef = db.collection('quizzes');
    
    const docRef = await collectionRef.add({
      ...finalQuizData,
      createdAt: FieldValue.serverTimestamp(),
    });

    if (!docRef || !docRef.id) {
      throw new Error('Failed to create quiz document.');
    }

    redirect(`/quiz/${docRef.id}/share`);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to create the quiz. Please try again.');
  }
}
