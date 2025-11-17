'use client';

import { useEffect } from 'react';
import Header from '@/components/Header';
import { QuizTaker } from '@/components/quiz/QuizTaker';
import { notFound, useParams } from 'next/navigation';
import { useFirebase } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { Quiz } from '@/app/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function QuizPage() {
  const params = useParams();
  const id = params.id as string;
  const { firestore } = useFirebase();

  const quizRef = firestore ? doc(firestore, 'quizzes', id) : null;
  const { data: quiz, isLoading } = useDoc<Omit<Quiz, 'id'>>(quizRef);
  
  useEffect(() => {
    if (quiz) {
      document.title = `Quiz: ${quiz.title}`;
    } else {
      document.title = 'Quiz';
    }
  }, [quiz]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-2xl mx-auto space-y-4">
               <Skeleton className="h-8 w-3/4" />
               <Skeleton className="h-4 w-1/4" />
               <Skeleton className="h-4 w-full" />
               <div className="space-y-4 pt-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
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
          <QuizTaker quiz={{ ...quiz, id }} />
        </div>
      </main>
    </div>
  );
}
