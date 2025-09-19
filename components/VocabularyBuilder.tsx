import React, { useState, useEffect, useCallback } from 'react';
import { WordData, RussianExplanation } from '../types';
import { getWordOfTheDay, getRussianExplanation } from '../services/geminiService';
import Card from './ui/Card';
import Button from './ui/Button';
import FullPageSpinner from './ui/Spinner';
import { SpeakerIcon } from './icons/Icons';
import { useAppContext } from '../contexts/AppContext';

const VocabularyBuilder: React.FC = () => {
  const { learningLevel } = useAppContext();
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [russianExplanation, setRussianExplanation] = useState<RussianExplanation | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const fetchWord = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRussianExplanation(null);
    setTranslationError(null);
    try {
      const data = await getWordOfTheDay(learningLevel);
      setWordData(data);
    } catch (err) {
      setError('Failed to fetch a new word. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [learningLevel]);

  useEffect(() => {
    fetchWord();
  }, [fetchWord]);

  const handleShowExplanation = async () => {
    if (!wordData) return;
    setIsTranslating(true);
    setTranslationError(null);
    try {
      const explanation = await getRussianExplanation(wordData.word, wordData.definition, wordData.examples);
      setRussianExplanation(explanation);
    } catch (err) {
      setTranslationError('Could not fetch the explanation. Please try again.');
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePlayAudio = () => {
    if (!wordData || !window.speechSynthesis) {
      console.warn('Text-to-speech not supported or word data is not available.');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(wordData.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-1 text-slate-700">Vocabulary Builder</h2>
      <p className="text-slate-500 mb-6">Discover a new word each day to expand your lexicon.</p>
      
      {isLoading ? (
        <FullPageSpinner />
      ) : error ? (
        <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">
          <p>{error}</p>
          <Button onClick={fetchWord} className="mt-4">Try Again</Button>
        </div>
      ) : wordData ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-4xl font-bold text-blue-600">{wordData.word}</h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-500 italic">{wordData.pronunciation}</p>
              <button
                onClick={handlePlayAudio}
                className="text-slate-500 hover:text-blue-600 focus:text-blue-600 focus:outline-none transition-colors duration-200"
                aria-label="Listen to pronunciation"
                title="Listen to pronunciation"
              >
                <SpeakerIcon />
              </button>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-600 mb-1">Definition</h4>
            <p className="text-slate-800">{wordData.definition}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-600 mb-2">Examples</h4>
            <ul className="space-y-2 list-disc list-inside text-slate-800">
                {wordData.examples.map((ex, index) => (
                    <li key={index} className="italic">"{ex}"</li>
                ))}
            </ul>
          </div>

          {russianExplanation && (
            <div className="p-4 bg-cyan-50 rounded-lg space-y-4">
               <div>
                  <h4 className="font-semibold text-cyan-700 mb-1">Russian Explanation</h4>
                  <p className="text-cyan-900 whitespace-pre-wrap">{russianExplanation.explanation}</p>
               </div>
               <div>
                  <h5 className="font-semibold text-cyan-700 mb-2">Translated Examples</h5>
                  <ul className="space-y-2 list-disc list-inside text-cyan-900">
                      {russianExplanation.translatedExamples.map((ex, index) => (
                          <li key={index} className="italic">"{ex}"</li>
                      ))}
                  </ul>
               </div>
            </div>
          )}
          
          <div className="text-center pt-6 border-t border-slate-200 flex flex-wrap justify-center gap-4">
            <Button onClick={fetchWord} isLoading={isLoading}>
              Get New Word
            </Button>
            {!russianExplanation && (
              <Button onClick={handleShowExplanation} isLoading={isTranslating} variant="secondary">
                Show Russian Explanation
              </Button>
            )}
          </div>
           {translationError && (
              <p className="text-center text-sm text-red-600 -mt-2">{translationError}</p>
          )}
        </div>
      ) : null}
    </Card>
  );
};

export default VocabularyBuilder;