import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Header from '@/components/Header';
import { ArrowRight, BrainCircuit, Share2, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: <BrainCircuit className="w-8 h-8 text-primary" />,
    title: 'Easy Quiz Creation',
    description: 'Quickly build quizzes on any topic you can imagine.',
  },
  {
    icon: <Trophy className="w-8 h-8 text-primary" />,
    title: 'Multiple Quiz Types',
    description: 'Create quizzes with multiple choice, true/false, and short answer questions.',
  },
  {
    icon: <Share2 className="w-8 h-8 text-primary" />,
    title: 'Share with Ease',
    description: 'Share your creations with a unique link and challenge your friends.',
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-quiz');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative w-full pt-12 md:pt-24 lg:pt-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Create and Share Engaging Quizzes
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Welcome to QuizCrafter. Effortlessly create, customize, and share quizzes on any subject.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/create">
                      Create Your First Quiz
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative h-64 md:h-auto">
                {heroImage && (
                  <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    data-ai-hint={heroImage.imageHint}
                    fill
                    className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Three simple steps to build and share your knowledge.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 mt-12">
              {features.map((feature, index) => (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {feature.icon}
                    <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center py-6 border-t">
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} QuizCrafter. All rights reserved.</p>
      </footer>
    </div>
  );
}
