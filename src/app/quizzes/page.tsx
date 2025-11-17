
'use client';

import { useMemo } from 'react';
import Header from '@/components/Header';
import { useFirebase, useMemoFirebase } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import type { Quiz } from '@/app/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen } from 'lucide-react';

function QuizList() {
  const { firestore } = useFirebase();

  const quizzesCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'quizzes');
  }, [firestore]);

  const { data: quizzes, isLoading } = useCollection<Omit<Quiz, 'id'>>(quizzesCollectionRef);

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-10 w-28" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">No Quizzes Found</h2>
        <p className="mt-2 text-muted-foreground">
          It looks like no quizzes have been created yet.
        </p>
        <Button asChild className="mt-6">
          <Link href="/create">Create the First Quiz!</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <Card key={quiz.id} className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">{quiz.title}</CardTitle>
            <CardDescription>{quiz.questions.length} questions</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow"></CardContent>
          <CardFooter>
            <Button asChild>
              <Link href={`/quiz/${quiz.id}`}>
                Take Quiz <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}


export default function BrowseQuizzesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-headline font-bold">Browse Quizzes</h1>
            <p className="text-muted-foreground">
              Explore and test your knowledge with our collection of quizzes.
            </p>
          </div>
          <QuizList />
        </div>
      </main>
    </div>
  );
}
