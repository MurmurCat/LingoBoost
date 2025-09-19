
export type Section = 'vocabulary' | 'grammar' | 'reading' | 'conversation';

export interface WordData {
  word: string;
  definition: string;
  example: string;
  pronunciation: string;
}

export interface GrammarExercise {
  incorrectSentence: string;
  correctSentence: string;
  explanation: string;
}

export interface ReadingQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface ReadingPassage {
  title: string;
  passage: string;
  questions: ReadingQuestion[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
