import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b">
      <Link href="/" className="flex items-center justify-center">
        <BrainCircuit className="h-6 w-6 text-primary" />
        <span className="ml-2 text-xl font-headline font-semibold">QuizMaster</span>
      </Link>
    </header>
  );
}
