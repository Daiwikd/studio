
'use client';

import { BrainCircuit, Library, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { ModeToggle } from './mode-toggle';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

function UserMenu({ user, onLogout }: { user: any; onLogout: () => void }) {
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName || 'Anonymous'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header() {
  const homeUrl = '/';
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

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
        {!isUserLoading && (
          <>
            {user ? (
              <UserMenu user={user} onLogout={handleLogout} />
            ) : (
              <Button asChild variant="ghost">
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            )}
          </>
        )}
      </nav>
    </header>
  );
}
