export type Question = {
  id?: string;
  question: string;
  options: string[];
  answer: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
};

export type Quiz = {
  id: string;
  title: string;
  questions: Question[];
};
