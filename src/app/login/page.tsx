'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// This mapping allows using usernames to log in while using Firebase's email-based auth.
const usernameToEmailMap: Record<string, string> = {
  'daiwikd': 'daiwikd@email.com',
  'shivam': 'shivam@email.com',
};

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    
    const email = usernameToEmailMap[data.username.toLowerCase()];

    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid username.',
      });
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, data.password);
      toast({
        title: 'Login Successful',
        description: "You've been successfully logged in.",
      });
      router.push('/'); // Redirect to home or dashboard after login
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        // User does not exist, so create them
        try {
            await createUserWithEmailAndPassword(auth, email, data.password);
            // try to sign in again after creating user
            await signInWithEmailAndPassword(auth, email, data.password);
            toast({
              title: 'Account Created & Logged In',
              description: "Welcome! Your account has been created.",
            });
            router.push('/');
        } catch (creationError: any) {
            console.error("Error creating user:", creationError);
            toast({
              variant: 'destructive',
              title: 'Registration Failed',
              description: 'Could not create your account. Please try again.',
            });
        }
      } else {
        console.error("Login Error:", error);
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Invalid username or password.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to continue to QuizCrafter</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  {...register('username')}
                />
                {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register('password')} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
