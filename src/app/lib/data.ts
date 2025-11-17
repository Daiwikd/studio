'use server';

import type { Quiz } from './types';
import {
  getFirestore,
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
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
    return { id: docSnap.id, ...docSnap.data() } as Quiz;
  } else {
    return undefined;
  }
};

export const addQuiz = async (
  quiz: Omit<Quiz, 'id'>
): Promise<{ id: string }> => {
  const { firestore } = initializeFirebase();
  const collectionRef = collection(firestore, 'quizzes');

  const docRef = await addDoc(collectionRef, {
    ...quiz,
    createdAt: serverTimestamp(),
  });
  
  if (!docRef) {
    throw new Error("Failed to create quiz document.");
  }

  return { id: docRef.id };
};
