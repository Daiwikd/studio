'use server';

/**
 * @fileOverview A quiz question generator AI agent.
 *
 * - generateQuizQuestions - A function that handles the quiz question generation process.
 * - GenerateQuizQuestionsInput - The input type for the generateQuizQuestions function.
 * - GenerateQuizQuestionsOutput - The return type for the generateQuizQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate quiz questions.'),
  numberOfQuestions: z
    .number()
    .min(1)
    .max(10)
    .describe('The number of quiz questions to generate.'),
});
export type GenerateQuizQuestionsInput = z.infer<
  typeof GenerateQuizQuestionsInputSchema
>;

const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().describe('The quiz question.'),
        answer: z.string().describe('The answer to the quiz question.'),
        options: z
          .array(z.string())
          .optional()
          .describe('The possible options for multiple choice questions.'),
        type: z
          .enum(['multiple_choice', 'true_false', 'short_answer'])
          .describe('The type of the quiz question.'),
      })
    )
    .describe('The generated quiz questions.'),
});
export type GenerateQuizQuestionsOutput = z.infer<
  typeof GenerateQuizQuestionsOutputSchema
>;

export async function generateQuizQuestions(
  input: GenerateQuizQuestionsInput
): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are a quiz generator AI. Generate {{numberOfQuestions}} quiz questions and answers based on the topic: {{{topic}}}. The questions should be a mix of multiple choice, true/false and short answer questions. For multiple choice questions, provide 4 options. Return the questions in JSON format. Follow the schema definition closely.`,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
