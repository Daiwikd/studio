'use client';

import { useEffect } from 'react';
import Header from '@/components/Header';
import { QuizResults } from '@/components/quiz/QuizResults';
import { notFound, useParams } from 'next/navigation';
import { useFirebase, useMemoFirebase } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { Quiz } from '@/app/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


export default function ResultsPage() {
  const params = useParams();
  const id = params.id as string;
  const { firestore } = useFirebase();

  const quizRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'quizzes', id);
  }, [firestore, id]);

  const { data: quiz, isLoading } = useDoc<Omit<Quiz, 'id'>>(quizRef);
  
  useEffect(() => {
    if (quiz) {
      document.title = `Results for ${quiz.title}`;
    } else {
      document.title = 'Quiz Results';
    }
  }, [quiz]);

  if (isLoading) {
    return (
       <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-3xl mx-auto space-y-8 text-center">
               <Skeleton className="h-10 w-2/3 mx-auto" />
               <Skeleton className="h-6 w-1/3 mx-auto" />
               <Skeleton className="h-16 w-1/2 mx-auto" />
               <div className="flex justify-center gap-4 pt-4">
                <Skeleton className="h-12 w-32" />
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
          <QuizResults quiz={{...quiz, id}} />
        </div>
      </main>
    </div>
  );
}
