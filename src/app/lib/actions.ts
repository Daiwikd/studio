'use server';

import {
  generateQuizQuestions,
  type GenerateQuizQuestionsOutput,
} from '@/ai/flows/generate-quiz-questions';
import { type Question } from './types';
import { generateQuestionsSchema, type GenerateQuestionsState } from './schemas';


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
