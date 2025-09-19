export type Section = 'vocabulary' | 'grammar' | 'reading' | 'conversation' | 'vocabularyCourse';
export type LearningLevel = 'B1' | 'B2';

export interface WordData {
  word: string;
  definition: string;
  examples: string[];
  pronunciation: string;
}

export interface RussianExplanation {
  explanation: string;
  translatedExamples: string[];
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