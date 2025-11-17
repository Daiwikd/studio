import type { Quiz } from './types';

// In-memory store for quizzes. NOTE: This will be reset on every server restart.
const quizzes: Quiz[] = [];

export const getQuizById = async (id: string): Promise<Quiz | undefined> => {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 50));
  return quizzes.find((quiz) => quiz.id === id);
};

export const addQuiz = async (quiz: Omit<Quiz, 'id'>): Promise<Quiz> => {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 50));
  const newQuiz: Quiz = {
    id: crypto.randomUUID(),
    ...quiz,
  };
  quizzes.push(newQuiz);
  return newQuiz;
};
