
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { WordData, GrammarExercise, ReadingPassage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const wordSchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    pronunciation: { type: Type.STRING },
    definition: { type: Type.STRING },
    example: { type: Type.STRING },
  },
  required: ['word', 'pronunciation', 'definition', 'example'],
};

const grammarSchema = {
    type: Type.OBJECT,
    properties: {
        incorrectSentence: { type: Type.STRING },
        correctSentence: { type: Type.STRING },
        explanation: { type: Type.STRING },
    },
    required: ['incorrectSentence', 'correctSentence', 'explanation'],
};

const readingSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        passage: { type: Type.STRING },
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    },
                    correctAnswerIndex: { type: Type.INTEGER },
                },
                required: ['question', 'options', 'correctAnswerIndex'],
            },
        },
    },
    required: ['title', 'passage', 'questions'],
};

export const getWordOfTheDay = async (): Promise<WordData> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Generate a single, interesting English vocabulary word suitable for an intermediate (B1/B2 level) learner. Provide its pronunciation, a clear definition, and an example sentence.',
        config: {
            responseMimeType: 'application/json',
            responseSchema: wordSchema,
            temperature: 0.8,
        },
    });
    
    const json = JSON.parse(response.text);
    return json as WordData;
};

export const getGrammarExercise = async (): Promise<GrammarExercise> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Create a grammar exercise for an intermediate English learner. Provide a single sentence that contains a common grammatical error (e.g., tense, prepositions, articles). Also provide the corrected sentence and a brief, clear explanation of the error.',
        config: {
            responseMimeType: 'application/json',
            responseSchema: grammarSchema,
            temperature: 0.7,
        },
    });
    const json = JSON.parse(response.text);
    return json as GrammarExercise;
};

export const getReadingPassage = async (): Promise<ReadingPassage> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Generate a short reading passage (about 150-200 words) for an intermediate English learner (B1 level). The topic should be interesting and general. After the passage, create 3 multiple-choice questions to test comprehension. Each question should have 4 options. Indicate the correct answer index (0-3).',
        config: {
            responseMimeType: 'application/json',
            responseSchema: readingSchema,
        },
    });
    const json = JSON.parse(response.text);
    return json as ReadingPassage;
};


let chatInstance: Chat | null = null;

export const getChatInstance = (): Chat => {
    if (!chatInstance) {
        chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'You are a friendly and patient English tutor. Your goal is to help an intermediate English learner practice their conversational skills. Keep your responses encouraging, clear, and not too complex. Correct their significant grammar mistakes gently and provide brief explanations.',
            },
        });
    }
    return chatInstance;
};
