import React, { useState, useEffect, useCallback } from 'react';
import { WordData, RussianExplanation } from '../types';
import { getWordBatch, getRussianExplanation } from '../services/geminiService';
import Card from './ui/Card';
import Button from './ui/Button';
import FullPageSpinner from './ui/Spinner';
import { SpeakerIcon } from './icons/Icons';
import { useAppContext } from '../contexts/AppContext';

const GOAL = 2000;
const BATCH_SIZE = 10;
const LOCAL_STORAGE_KEY = 'lingoboost-learned-words';

interface WordCardProps {
    wordData: WordData;
    onMarkLearned: (word: WordData) => void;
}

const WordCard: React.FC<WordCardProps> = ({ wordData, onMarkLearned }) => {
    const [russianExplanation, setRussianExplanation] = useState<RussianExplanation | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [translationError, setTranslationError] = useState<string | null>(null);

    const handlePlayAudio = () => {
        if (!window.speechSynthesis) return;
        const utterance = new SpeechSynthesisUtterance(wordData.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    const handleShowExplanation = async () => {
        setIsTranslating(true);
        setTranslationError(null);
        try {
          const explanation = await getRussianExplanation(wordData.word, wordData.definition, wordData.examples);
          setRussianExplanation(explanation);
        } catch (err) {
          setTranslationError('Could not fetch the explanation.');
          console.error(err);
        } finally {
          setIsTranslating(false);
        }
      };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col h-full">
            <div className="flex-grow">
                <h4 className="text-2xl font-bold text-blue-600">{wordData.word}</h4>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-slate-500 italic">{wordData.pronunciation}</p>
                    <button
                        onClick={handlePlayAudio}
                        className="text-slate-500 hover:text-blue-600 focus:outline-none"
                        aria-label="Listen to pronunciation"
                    >
                        <SpeakerIcon />
                    </button>
                </div>
                <p className="text-slate-700 mt-3">{wordData.definition}</p>
                <ul className="space-y-2 list-disc list-inside text-slate-600 mt-3 text-sm">
                    {wordData.examples.map((ex, i) => <li key={i} className="italic">"{ex}"</li>)}
                </ul>
            </div>
            
            {russianExplanation && (
                <div className="p-3 my-4 bg-cyan-50 rounded-lg space-y-3 text-sm">
                   <div>
                      <h5 className="font-semibold text-cyan-700 mb-1">Russian Explanation</h5>
                      <p className="text-cyan-900 whitespace-pre-wrap">{russianExplanation.explanation}</p>
                   </div>
                   <div>
                      <h6 className="font-semibold text-cyan-700 mb-1">Translated Examples</h6>
                      <ul className="space-y-1 list-disc list-inside text-cyan-900">
                          {russianExplanation.translatedExamples.map((ex, index) => (
                              <li key={index} className="italic">"{ex}"</li>
                          ))}
                      </ul>
                   </div>
                </div>
            )}
             {translationError && (
              <p className="text-center text-xs text-red-600 mt-1">{translationError}</p>
            )}

            <div className="mt-auto pt-4 flex flex-col sm:flex-row gap-2">
                {!russianExplanation && (
                    <Button 
                        onClick={handleShowExplanation} 
                        isLoading={isTranslating} 
                        className="flex-1" 
                        variant="secondary"
                    >
                        Russian Explanation
                    </Button>
                )}
                <Button onClick={() => onMarkLearned(wordData)} className="flex-1" variant="secondary">
                    Mark as Learned
                </Button>
            </div>
        </div>
    );
};


const VocabularyCourse: React.FC = () => {
    const { learningLevel } = useAppContext();
    const [learnedWords, setLearnedWords] = useState<WordData[]>([]);
    const [currentBatch, setCurrentBatch] = useState<WordData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showLearnedList, setShowLearnedList] = useState(false);

    useEffect(() => {
        try {
            const storedWords = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedWords) {
                setLearnedWords(JSON.parse(storedWords));
            }
        } catch (e) {
            console.error("Failed to load words from local storage", e);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(learnedWords));
        } catch (e) {
            console.error("Failed to save words to local storage", e);
        }
    }, [learnedWords]);

    const handleFetchBatch = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const wordStrings = learnedWords.map(w => w.word);
            const data = await getWordBatch(learningLevel, BATCH_SIZE, wordStrings);
            setCurrentBatch(data);
        } catch (err) {
            setError("Failed to fetch a new batch of words. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [learningLevel, learnedWords]);

    const handleMarkAsLearned = (word: WordData) => {
        if (!learnedWords.some(w => w.word === word.word)) {
            setLearnedWords(prev => [...prev, word]);
        }
        setCurrentBatch(prev => prev.filter(w => w.word !== word.word));
    };

    const progressPercentage = Math.min((learnedWords.length / GOAL) * 100, 100);

    return (
        <Card>
            <h2 className="text-2xl font-bold mb-1 text-slate-700">Vocabulary Course</h2>
            <p className="text-slate-500 mb-6">Build your vocabulary towards the 2000-word milestone.</p>
            
            <div className="mb-8">
                <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-blue-700">Progress</span>
                    <span className="text-sm font-medium text-blue-700">{learnedWords.length} / {GOAL} words</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>

            {isLoading && <FullPageSpinner />}

            {!isLoading && error && (
                <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">
                    <p>{error}</p>
                    <Button onClick={handleFetchBatch} className="mt-4">Try Again</Button>
                </div>
            )}

            {!isLoading && !error && currentBatch.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold text-slate-600 mb-4">New Words to Learn</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentBatch.map(wordData => (
                            <WordCard key={wordData.word} wordData={wordData} onMarkLearned={handleMarkAsLearned} />
                        ))}
                    </div>
                </div>
            )}

            {!isLoading && !error && currentBatch.length === 0 && (
                <div className="text-center bg-slate-50 p-8 rounded-lg">
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">Ready for more?</h3>
                    <p className="text-slate-500 mb-4">You've finished this batch. Get a new set of words to continue your journey.</p>
                    <Button onClick={handleFetchBatch} isLoading={isLoading}>Learn {BATCH_SIZE} New Words</Button>
                </div>
            )}
            
            {learnedWords.length > 0 && (
                 <div className="mt-12 border-t pt-8">
                    <button onClick={() => setShowLearnedList(!showLearnedList)} className="w-full text-left flex justify-between items-center text-slate-600 hover:text-slate-800">
                        <h3 className="text-xl font-semibold">
                            My Learned Vocabulary ({learnedWords.length})
                        </h3>
                        <span className={`transform transition-transform duration-200 ${showLearnedList ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    {showLearnedList && (
                        <div className="mt-4 bg-slate-50 p-4 rounded-lg max-h-72 overflow-y-auto">
                            <ul className="space-y-2">
                                {learnedWords.slice().reverse().map(w => (
                                    <li key={w.word} className="text-sm text-slate-700">
                                        <strong className="font-semibold text-slate-800">{w.word}</strong>: {w.definition}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

        </Card>
    );
};

export default VocabularyCourse;