'use client';

import { useEffect } from 'react';
import Header from '@/components/Header';
import { ShareQuiz } from '@/components/quiz/ShareQuiz';
import { notFound, useParams } from 'next/navigation';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { Skeleton } from '@/components/ui/skeleton';

export default function SharePage() {
  const params = useParams();
  const id = params.id as string;
  const { firestore } = useFirebase();

  const quizRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'quizzes', id);
  }, [firestore, id]);
  const { data: quiz, isLoading } = useDoc(quizRef);

  useEffect(() => {
    document.title = 'Share Your Quiz';
  }, []);

  if (isLoading) {
     return (
       <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 md:py-12">
              <div className="max-w-2xl mx-auto text-center space-y-4">
                <Skeleton className="h-12 w-12 mx-auto rounded-full" />
                <Skeleton className="h-10 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto" />
                <div className="flex space-x-2 pt-4">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-10" />
                </div>
                 <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                  <Skeleton className="h-12 w-full sm:w-40" />
                  <Skeleton className="h-12 w-full sm:w-48" />
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
            <ShareQuiz quizId={quiz.id} />
        </div>
      </main>
    </div>
  );
}
