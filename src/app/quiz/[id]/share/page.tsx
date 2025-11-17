import { getQuizById } from '@/app/lib/data';
import Header from '@/components/Header';
import { ShareQuiz } from '@/components/quiz/ShareQuiz';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Share Your Quiz',
};

export default async function SharePage({ params }: { params: { id: string } }) {
  const quiz = await getQuizById(params.id);

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
