'use client';
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
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

// NOTE: This file is now client-side safe as it uses the client SDK.
// The functions now require a Firestore instance to be passed in.

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

  // Use the non-blocking update to add the document
  const docRefPromise = addDocumentNonBlocking(collectionRef, {
    ...quiz,
    createdAt: serverTimestamp(),
  });

  // We need to wait for the promise to resolve to get the ID for the redirect.
  // In other scenarios, you might not need to wait.
  const docRef = await docRefPromise;
  
  if (!docRef) {
    throw new Error("Failed to create quiz document.");
  }

  return { id: docRef.id };
};
