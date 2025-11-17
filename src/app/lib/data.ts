'use server';

import type { Quiz } from './types';
import { getAdminDB } from '@/firebase/admin';

export const getQuizById = async (
  id: string
): Promise<Quiz | undefined> => {
  const db = getAdminDB();
  const docRef = db.collection('quizzes').doc(id);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    const data = docSnap.data();
    if (data) {
      return { 
        id: docSnap.id,
        title: data.title,
        questions: data.questions,
        createdAt: data.createdAt.toDate(),
      } as Quiz;
    }
  } 
  
  return undefined;
};
