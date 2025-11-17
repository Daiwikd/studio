'use client';

import { useState, useMemo } from 'react';
import type { Quiz, Question } from '@/app/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';

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


export function QuizTaker({ quiz }: { quiz: Quiz }) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});

  const questionsWithIds = useMemo(() => addStableIdsToQuestions(quiz.questions), [quiz.questions]);
  
  const currentQuestion = questionsWithIds[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionsWithIds.length) * 100;

  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const goToNext = () => {
    if (currentQuestionIndex < questionsWithIds.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishQuiz = () => {
    localStorage.setItem(`quiz_${quiz.id}_answers`, JSON.stringify(userAnswers));
    router.push(`/quiz/${quiz.id}/results`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{quiz.title}</CardTitle>
          <CardDescription>
            Question {currentQuestionIndex + 1} of {questionsWithIds.length}
          </CardDescription>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6 min-h-[200px]">
          <p className="text-lg font-semibold">{currentQuestion.question}</p>
          <div className="space-y-4">
            {currentQuestion.type === 'multiple_choice' && (
              <RadioGroup
                value={userAnswers[currentQuestion.id]}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${currentQuestion.id}-option-${index}`} />
                    <Label htmlFor={`${currentQuestion.id}-option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
             {currentQuestion.type === 'true_false' && (
              <RadioGroup
                value={userAnswers[currentQuestion.id]}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="True" id={`${currentQuestion.id}-true`} />
                  <Label htmlFor={`${currentQuestion.id}-true`}>True</Label>
                </div>
                 <div className="flex items-center space-x-2">
                  <RadioGroupItem value="False" id={`${currentQuestion.id}-false`} />
                  <Label htmlFor={`${currentQuestion.id}-false`}>False</Label>
                </div>
              </RadioGroup>
            )}
            {currentQuestion.type === 'short_answer' && (
                <Input
                    value={userAnswers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="Your answer..."
                />
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={goToPrevious} disabled={currentQuestionIndex === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          {currentQuestionIndex < questionsWithIds.length - 1 ? (
            <Button onClick={goToNext}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={finishQuiz} className="bg-green-600 hover:bg-green-700">
              Finish Quiz <Check className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
