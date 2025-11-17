'use server';

import type { Quiz } from './types';
import {
  getFirestore,
  doc,
  getDoc,
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// NOTE: This file is now server-side safe.
// These functions can be called from Server Actions or Route Handlers.

export const getQuizById = async (
  id: string
): Promise<Quiz | undefined> => {
  const { firestore } = initializeFirebase();
  const docRef = doc(firestore, 'quizzes', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    // The type assertion here is okay because we trust the data from our DB
    // In a more complex app, you might want to validate this with Zod as well
    return { id: docSnap.id, ...docSnap.data() } as Quiz;
  } else {
    return undefined;
  }
};
