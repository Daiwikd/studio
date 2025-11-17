'use server';

import {
  generateQuizQuestions,
  type GenerateQuizQuestionsOutput,
} from '@/ai/flows/generate-quiz-questions';
import { redirect } from 'next/navigation';
import type { Question } from './types';
import { createQuizSchema, generateQuestionsSchema, type GenerateQuestionsState } from './schemas';
import { getAdminDB } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

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

    // Ensure generated questions have a temporary client-side ID for the form.
    const questions: Question[] = output.questions.map((q) => ({
      id: randomId(), 
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

  // **THE DEFINITIVE FIX**: Explicitly create new question objects, discarding the client-side `id`.
  // This guarantees that only the properties defined here are saved to Firestore.
  const questionsForDb = quizData.questions.map(q => ({
    question: q.question,
    answer: q.answer,
    options: q.options || [], // Ensure options is an array
    type: q.type,
  }));

  const finalQuizData = {
    title: quizData.title,
    questions: questionsForDb, // Use the clean array of questions
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
    // This redirect will be caught by the client and followed
    redirect(`/quiz/${docRef.id}/share`);

  } catch (error) {
    console.error(error);
    throw new Error('Failed to create the quiz. Please try again.');
  }
}
