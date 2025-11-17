'use client';

import {
  createQuizAction,
  generateQuestionsAction,
} from '@/app/lib/actions';
import type { GenerateQuestionsState } from '@/app/lib/schemas';
import { createQuizSchema } from '@/app/lib/schemas';
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
import { useForm, useFieldArray } from 'react-hook-form';
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
import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type QuizFormData = z.infer<typeof createQuizSchema>;

function GeneratorForm({
  onQuestionsGenerated,
}: {
  onQuestionsGenerated: (questions: GenerateQuestionsState['questions']) => void;
}) {
  const [state, formAction] = useFormState(generateQuestionsAction, {});
  const { pending } = useFormStatus();
  const { toast } = useToast();

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
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem>
          <FormLabel>Topic</FormLabel>
          <FormControl>
            <Input name="topic" placeholder="e.g., The Roman Empire" required />
          </FormControl>
          <FormDescription>The topic for your quiz.</FormDescription>
        </FormItem>
        <FormItem>
          <FormLabel>Number of Questions</FormLabel>
          <FormControl>
            <Select name="numberOfQuestions" defaultValue="5">
              <SelectTrigger>
                <SelectValue placeholder="Select number" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(10)].map((_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormDescription>Number of questions to generate.</FormDescription>
        </FormItem>
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
  );
}

function QuestionForm({ form }: { form: ReturnType<typeof useForm<QuizFormData>> }) {
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'questions',
  });
  
  const addQuestion = () => {
    append({
      id: crypto.randomUUID(),
      question: '',
      answer: '',
      options: [],
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <div className="space-y-2">
                  <FormLabel>Options</FormLabel>
                  {form.watch(`questions.${index}.options`).map((_, optionIndex) => (
                    <FormField
                      key={optionIndex}
                      control={form.control}
                      name={`questions.${index}.options.${optionIndex}`}
                      render={({ field }) => (
                        <FormItem>
                           <FormControl>
                             <Input {...field} placeholder={`Option ${optionIndex + 1}`} />
                           </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
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

export function CreateQuizForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const form = useForm<QuizFormData>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      title: '',
      questions: [],
    },
  });

  const { isSubmitting, errors } = form.formState;

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
              ref={formRef}
              action={async () => {
                const valid = await form.trigger();
                if (valid) {
                  const formData = new FormData();
                  formData.set('data', JSON.stringify(form.getValues()));
                  await createQuizAction(formData);
                } else {
                   toast({
                    variant: 'destructive',
                    title: 'Validation Error',
                    description: 'Please fix the errors before submitting.',
                  });
                }
              }}
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
