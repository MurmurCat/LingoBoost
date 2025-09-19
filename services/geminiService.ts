import { GoogleGenAI, Type, Chat } from "@google/genai";
import { WordData, GrammarExercise, ReadingPassage, RussianExplanation, LearningLevel } from '../types';

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
    examples: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
    },
  },
  required: ['word', 'pronunciation', 'definition', 'examples'],
};

const wordsArrayWrapperSchema = {
    type: Type.OBJECT,
    properties: {
        words: {
            type: Type.ARRAY,
            items: wordSchema
        }
    },
    required: ['words']
};

const russianExplanationSchema = {
    type: Type.OBJECT,
    properties: {
        explanation: { type: Type.STRING },
        translatedExamples: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    },
    required: ['explanation', 'translatedExamples']
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

export const getWordOfTheDay = async (level: LearningLevel): Promise<WordData> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a single, interesting English vocabulary word suitable for an intermediate (${level} level) learner. Provide its pronunciation, a clear definition, and three distinct example sentences.`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: wordSchema,
            temperature: 0.8,
        },
    });
    
    const json = JSON.parse(response.text);
    return json as WordData;
};

export const getWordBatch = async (level: LearningLevel, count: number, learnedWords: string[]): Promise<WordData[]> => {
    // To avoid making the prompt too long, we only pass the most recent learned words.
    const wordsToExclude = learnedWords.length > 200 ? learnedWords.slice(-200) : learnedWords;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a list of ${count} distinct English vocabulary words suitable for an intermediate (${level} level) learner. The words should be useful and not too obscure. Do not include any of the following words in your response: ${wordsToExclude.join(', ')}. For each word, provide its pronunciation, a clear definition, and three distinct example sentences.`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: wordsArrayWrapperSchema,
            temperature: 0.9,
        },
    });

    const json = JSON.parse(response.text);
    return (json.words || []) as WordData[];
};


export const getGrammarExercise = async (level: LearningLevel): Promise<GrammarExercise> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a grammar exercise for an intermediate English learner (${level} level). Provide a single sentence that contains a common grammatical error (e.g., tense, prepositions, articles). Also provide the corrected sentence and a brief, clear explanation of the error.`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: grammarSchema,
            temperature: 0.7,
        },
    });
    const json = JSON.parse(response.text);
    return json as GrammarExercise;
};

export const getReadingPassage = async (level: LearningLevel): Promise<ReadingPassage> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a short reading passage (about 150-200 words) for an intermediate English learner (${level} level). The topic should be interesting and general. After the passage, create 3 multiple-choice questions to test comprehension. Each question should have 4 options. Indicate the correct answer index (0-3).`,
        config: {
            responseMimeType: 'application/json',
            responseSchema: readingSchema,
        },
    });
    const json = JSON.parse(response.text);
    return json as ReadingPassage;
};

export const getRussianExplanation = async (word: string, definition: string, examples: string[]): Promise<RussianExplanation> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Provide a simple Russian explanation for the English word "${word}", which means "${definition}". Also, translate the following English example sentences into Russian: ${JSON.stringify(examples)}. The explanation should be suitable for an intermediate English learner who is a native Russian speaker. Return a JSON object with 'explanation' and 'translatedExamples' fields.`,
        config: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: russianExplanationSchema,
        },
    });
    const json = JSON.parse(response.text);
    return json as RussianExplanation;
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