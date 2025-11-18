
import { BrainCircuit, Library } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { ModeToggle } from './mode-toggle';

export default function Header() {
  const homeUrl = '/';
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b">
      <Link href={homeUrl} className="flex items-center justify-center mr-auto">
        <BrainCircuit className="h-6 w-6 text-primary" />
        <div className="flex flex-col ml-2">
          <span className="text-xl font-headline font-semibold leading-none">QuizCrafter</span>
          <span className="text-xs text-muted-foreground">by Daiwikd</span>
        </div>
      </Link>
      <nav className="flex items-center gap-4">
        <Button asChild variant="ghost">
          <Link href="/quizzes">
            <Library className="mr-2 h-4 w-4" />
            Browse Quizzes
          </Link>
        </Button>
        <ModeToggle />
      </nav>
    </header>
  );
}
