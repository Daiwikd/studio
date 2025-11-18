'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useFirebase } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { useCollection, type WithId } from '@/firebase/firestore/use-collection';
import type { QuizDocument } from '@/app/lib/types';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useMemoFirebase } from '@/firebase/provider';

function QuizList() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [quizToDelete, setQuizToDelete] = useState<WithId<QuizDocument> | null>(null);

  const quizzesCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'quizzes');
  }, [firestore]);

  const { data: quizzes, isLoading } = useCollection<QuizDocument>(quizzesCollectionRef);

  const handleDelete = async () => {
    if (!firestore || !quizToDelete) return;

    try {
      const quizDocRef = doc(firestore, 'quizzes', quizToDelete.id);
      await deleteDoc(quizDocRef);
      toast({
        title: 'Quiz Deleted',
        description: `"${quizToDelete.title}" has been successfully deleted.`,
      });
    } catch (error) {
      console.error("Error deleting quiz: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete the quiz. Please try again.',
      });
    } finally {
      setQuizToDelete(null);
    }
  };


  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-40 w-80 p-4">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between items-center mt-4">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
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
    <AlertDialog>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="flex flex-col justify-between h-40 w-80 p-4">
            <CardHeader className="p-0">
              <CardTitle className="font-headline text-base">{quiz.title}</CardTitle>
              <CardDescription>{quiz.questions.length} questions</CardDescription>
            </CardHeader>
            <CardFooter className="p-0 flex justify-between items-center">
              <Button asChild size="sm">
                <Link href={`/quiz/${quiz.id}`}>
                  Take Quiz <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
               <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setQuizToDelete(quiz)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
            </CardFooter>
          </Card>
        ))}
      </div>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the quiz
            <span className="font-semibold"> "{quizToDelete?.title}"</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setQuizToDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
