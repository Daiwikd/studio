'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Quiz, Question } from '@/app/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home, RefreshCw, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

type UserAnswers = Record<string, string>;

// We need a stable ID for each question for the userAnswers map and React keys.
// Since the server doesn't send one, we'll create a new type that includes one.
type QuestionWithId = Omit<Question, 'id'> & { id: string };

function addStableIdsToQuestions(questions: Omit<Question, 'id'>[]): QuestionWithId[] {
    return questions.map((q, index) => ({
        ...q,
        id: `${index}-${q.question.slice(0, 10)}` // Create a simple, stable ID
    }));
}


export function QuizResults({ quiz }: { quiz: Quiz }) {
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [mounted, setMounted] = useState(false);
  
  // Memoize the questions with stable IDs
  const questionsWithIds = useMemo(() => addStableIdsToQuestions(quiz.questions), [quiz.questions]);

  useEffect(() => {
    const storedAnswers = localStorage.getItem(`quiz_${quiz.id}_answers`);
    if (storedAnswers) {
      setUserAnswers(JSON.parse(storedAnswers));
    }
    setMounted(true);
  }, [quiz.id]);

  const { score, total } = useMemo(() => {
    const score = questionsWithIds.reduce((acc, question) => {
      const correctAnswer = question.answer.trim().toLowerCase();
      const userAnswer = (userAnswers[question.id] || '').trim().toLowerCase();
      return acc + (correctAnswer === userAnswer ? 1 : 0);
    }, 0);
    return { score, total: questionsWithIds.length };
  }, [questionsWithIds, userAnswers]);

  const scorePercentage = total > 0 ? (score / total) * 100 : 0;

  if (!mounted) {
    return (
        <div className="flex justify-center items-center h-64">
            <p>Loading results...</p>
        </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Card className="text-center shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Quiz Complete!</CardTitle>
          <CardDescription>Results for "{quiz.title}"</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-5xl font-bold text-primary">{score} / {total}</p>
          <p className="text-xl text-muted-foreground">You scored {scorePercentage.toFixed(0)}%</p>
          <div className="flex justify-center gap-4 pt-4">
            <Button asChild variant="outline">
                <Link href={`/quiz/${quiz.id}`}><RefreshCw className="mr-2 h-4 w-4" /> Try Again</Link>
            </Button>
            <Button asChild>
                <Link href="/"><Home className="mr-2 h-4 w-4" /> Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div>
        <h2 className="text-2xl font-headline font-bold mb-4 text-center">Review Your Answers</h2>
        <Accordion type="single" collapsible className="w-full">
            {questionsWithIds.map((question, index) => {
                const userAnswer = userAnswers[question.id] || 'Not answered';
                const isCorrect = question.answer.trim().toLowerCase() === userAnswer.trim().toLowerCase();
                return (
                    <AccordionItem value={`item-${index}`} key={question.id}>
                        <AccordionTrigger>
                            <div className="flex items-center gap-2">
                                {isCorrect ? <CheckCircle2 className="h-5 w-5 text-green-500"/> : <XCircle className="h-5 w-5 text-destructive"/>}
                                <span className="text-left">Question {index + 1}: {question.question.substring(0, 60)}...</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                           <div className="p-4 bg-secondary/30 rounded-md space-y-2">
                             <p className="font-semibold">{question.question}</p>
                             <p className={`p-2 rounded-md ${isCorrect ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>Your answer: <span className="font-medium">{userAnswer}</span></p>
                             {!isCorrect && (
                                <p className="p-2 rounded-md bg-gray-200 dark:bg-gray-700">Correct answer: <span className="font-medium">{question.answer}</span></p>
                             )}
                           </div>
                        </AccordionContent>
                    </AccordionItem>
                )
            })}
        </Accordion>
      </div>
    </div>
  );
}
