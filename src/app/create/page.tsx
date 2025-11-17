import Header from '@/components/Header';
import { CreateQuizForm } from '@/components/quiz/CreateQuizForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create a New Quiz',
};

export default function CreateQuizPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="mx-auto max-w-3xl">
            <div className="space-y-2 text-center mb-8">
              <h1 className="text-3xl font-headline font-bold">Create Your Quiz</h1>
              <p className="text-muted-foreground">
                Start by generating questions with AI, then customize them to perfection.
              </p>
            </div>
            <CreateQuizForm />
          </div>
        </div>
      </main>
    </div>
  );
}
