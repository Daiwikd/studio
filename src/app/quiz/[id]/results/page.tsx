import { getQuizById } from '@/app/lib/data';
import Header from '@/components/Header';
import { QuizResults } from '@/components/quiz/QuizResults';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const quiz = await getQuizById(params.id);
   if (!quiz) {
    return { title: 'Quiz Not Found' };
  }
  return {
    title: `Results for ${quiz.title}`,
  };
}

export default async function ResultsPage({ params }: { params: { id:string } }) {
  const quiz = await getQuizById(params.id);

  if (!quiz) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <QuizResults quiz={quiz} />
        </div>
      </main>
    </div>
  );
}
