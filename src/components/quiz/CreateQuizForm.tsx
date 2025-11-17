'use client';

import { generateQuestionsAction } from '@/app/lib/actions';
import { type GenerateQuestionsState } from '@/app/lib/schemas';
import { createQuizSchema, generateQuestionsSchema } from '@/app/lib/schemas';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm, useFieldArray, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Loader2, Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useActionState, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

type QuizFormData = z.infer<typeof createQuizSchema>;
type GenerateQuestionsFormData = z.infer<typeof generateQuestionsSchema>;

function randomId() {
  return Math.random().toString(36).substring(2, 9);
}

function GeneratorForm({
  onQuestionsGenerated,
}: {
  onQuestionsGenerated: (questions: GenerateQuestionsState['questions']) => void;
}) {
  const [state, formAction, pending] = useActionState(generateQuestionsAction, {});
  const { toast } = useToast();

  const form = useForm<GenerateQuestionsFormData>({
    resolver: zodResolver(generateQuestionsSchema),
    defaultValues: {
      topic: '',
      numberOfQuestions: 5,
    },
  });

  useEffect(() => {
    if (state.questions) {
      onQuestionsGenerated(state.questions);
    }
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: state.error,
      });
    }
  }, [state, onQuestionsGenerated, toast]);
  
  return (
    <Form {...form}>
      <form
        action={formAction}
        onSubmit={form.handleSubmit(() => {
          const formData = new FormData();
          const data = form.getValues();
          formData.append('topic', data.topic);
          formData.append('numberOfQuestions', String(data.numberOfQuestions));
          formAction(formData);
        })}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topic</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., The Roman Empire" {...field} />
                </FormControl>
                <FormDescription>The topic for your quiz.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="numberOfQuestions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Questions</FormLabel>
                <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[...Array(10)].map((_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Number of questions to generate.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={pending} className="w-full md:w-auto">
          {pending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <BrainCircuit className="mr-2 h-4 w-4" />
          )}
          Generate with AI
        </Button>
      </form>
    </Form>
  );
}

function QuestionForm({ form }: { form: UseFormReturn<QuizFormData> }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });
  
  const addQuestion = () => {
    append({
      id: randomId(),
      question: '',
      answer: '',
      options: ['', '', '', ''],
      type: 'multiple_choice',
    });
  };

  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="w-full">
        {fields.map((field, index) => (
          <AccordionItem value={field.id} key={field.id}>
            <AccordionTrigger className='font-headline'>
              {`Question ${index + 1}: ${form.watch(`questions.${index}.question`).substring(0, 40) || 'New Question'}`}
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-4 bg-secondary/50 rounded-md space-y-4">
              <FormField
                control={form.control}
                name={`questions.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value === 'multiple_choice' && form.getValues(`questions.${index}.options`).length === 0) {
                          form.setValue(`questions.${index}.options`, ['', '', '', '']);
                        }
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a question type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        <SelectItem value="true_false">True/False</SelectItem>
                        <SelectItem value="short_answer">Short Answer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`questions.${index}.question`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., What is the capital of France?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch(`questions.${index}.type`) === 'multiple_choice' && (
                <OptionsArray form={form} questionIndex={index} />
              )}

              <FormField
                control={form.control}
                name={`questions.${index}.answer`}
                render={({ field }) => {
                  const type = form.watch(`questions.${index}.type`);
                  if (type === 'true_false') {
                    return (
                      <FormItem>
                        <FormLabel>Answer</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="True">True</SelectItem>
                            <SelectItem value="False">False</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    );
                  }
                  return (
                    <FormItem>
                      <FormLabel>Answer</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the correct answer" {...field} />
                      </FormControl>
                      {type === 'multiple_choice' && <FormDescription>The answer must exactly match one of the options.</FormDescription>}
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                <Trash2 className="mr-2 h-4 w-4" /> Remove Question
              </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Button type="button" variant="outline" onClick={addQuestion}>
        <Plus className="mr-2 h-4 w-4" /> Add Question
      </Button>
    </div>
  );
}

function OptionsArray({ form, questionIndex }: { form: UseFormReturn<QuizFormData>, questionIndex: number }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `questions.${questionIndex}.options`,
  });

  return (
    <div className="space-y-2">
      <FormLabel>Options</FormLabel>
      {fields.map((field, optionIndex) => (
        <div key={field.id} className="flex items-center gap-2">
          <FormField
            control={form.control}
            name={`questions.${questionIndex}.options.${optionIndex}`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input {...field} placeholder={`Option ${optionIndex + 1}`} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(optionIndex)} className="shrink-0">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      ))}
       <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append('')}
        className="mt-2"
      >
        <Plus className="mr-2 h-4 w-4" /> Add Option
      </Button>
    </div>
  );
}

export function CreateQuizForm() {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuizFormData>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      title: '',
      questions: [],
    },
  });

  const { errors } = form.formState;

  useEffect(() => {
    if (errors.questions?.message) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: errors.questions.message,
      });
    }
  }, [errors, toast]);

  const handleGeneratedQuestions = (
    questions?: GenerateQuestionsState['questions']
  ) => {
    if (questions) {
      form.setValue('questions', questions);
    }
  };

  const onSubmit = async (data: QuizFormData) => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore is not available. Please try again later.',
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const questionsForDb = data.questions.map(q => ({
        question: q.question,
        answer: q.answer,
        options: q.options || [],
        type: q.type,
      }));

      const finalQuizData = {
        title: data.title,
        questions: questionsForDb,
        createdAt: serverTimestamp(),
      };
      
      const collectionRef = collection(firestore, 'quizzes');
      const docRef = await addDoc(collectionRef, finalQuizData);

      toast({
        title: 'Success!',
        description: 'Your quiz has been created.',
      });

      router.push(`/quizzes`);

    } catch (error) {
      console.error("Error creating quiz:", error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Failed to create the quiz. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">1. Generate Questions (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <GeneratorForm onQuestionsGenerated={handleGeneratedQuestions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">2. Customize Your Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Quiz Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., World Capitals Challenge" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <QuestionForm form={form} />

              <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Quiz
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
