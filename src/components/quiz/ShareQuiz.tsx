'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Clipboard, PartyPopper, PlusCircle, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export function ShareQuiz({ quizId }: { quizId: string }) {
  const [quizUrl, setQuizUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setQuizUrl(`${window.location.origin}/quiz/${quizId}`);
  }, [quizId]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(quizUrl);
    setCopied(true);
    toast({
      title: 'Copied to clipboard!',
      description: 'You can now share your quiz link.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <PartyPopper className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl mt-4">Quiz Created Successfully!</CardTitle>
          <CardDescription>Your quiz is live. Share it with the world!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input value={quizUrl} readOnly />
            <Button onClick={copyToClipboard} size="icon" variant="outline">
              {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={quizUrl}>
                    <Trophy className="mr-2 h-4 w-4" />
                    Take Quiz Now
                </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Another Quiz
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
