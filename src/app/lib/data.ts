'use server';

import type { Quiz } from './types';
import { getAdminDB } from '@/firebase/server-init';

export const getQuizById = async (
  id: string
): Promise<Quiz | undefined> => {
  try {
    const db = getAdminDB();
    const docRef = db.collection('quizzes').doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      if (data) {
        // Make sure createdAt is a serializable type
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
        
        return { 
          id: docSnap.id,
          title: data.title,
          questions: data.questions,
          createdAt: createdAt,
        } as Quiz;
      }
    }
  } catch (error) {
    console.error(`Failed to get quiz by ID (${id}):`, error);
  }
  
  return undefined;
};
