
'use client';

import { useEffect } from 'react';
import Header from '@/components/Header';
import { EditQuizForm } from '@/components/quiz/EditQuizForm';
import { notFound, useParams } from 'next/navigation';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Skeleton } from '@/components/ui/skeleton';
import type { Quiz } from '@/app/lib/types';

export default function EditQuizPage() {
  const params = useParams();
  const id = params.id as string;
  const { firestore } = useFirebase();

  const quizRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'quizzes', id);
  }, [firestore, id]);
  
  const { data: quiz, isLoading } = useDoc<Omit<Quiz, 'id'>>(quizRef);

  useEffect(() => {
    if (quiz) {
      document.title = `Editing: ${quiz.title}`;
    }
  }, [quiz]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="mx-auto max-w-3xl">
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-6 w-1/4 mb-8" />
              <div className="space-y-8">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!quiz) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="mx-auto max-w-3xl">
            <div className="space-y-2 text-center mb-8">
              <h1 className="text-3xl font-headline font-bold">Edit Your Quiz</h1>
              <p className="text-muted-foreground">
                Make changes to your quiz questions, options, and answers.
              </p>
            </div>
            <EditQuizForm quiz={{ ...quiz, id }} />
          </div>
        </div>
      </main>
    </div>
  );
}
