
import React, { useState, useEffect, useCallback } from 'react';
import { WordData } from '../types';
import { getWordOfTheDay } from '../services/geminiService';
import Card from './ui/Card';
import Button from './ui/Button';
import FullPageSpinner from './ui/Spinner';

const VocabularyBuilder: React.FC = () => {
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWord = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWordOfTheDay();
      setWordData(data);
    } catch (err) {
      setError('Failed to fetch a new word. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <p className="text-slate-500 italic mt-1">{wordData.pronunciation}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-600 mb-1">Definition</h4>
            <p className="text-slate-800">{wordData.definition}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-600 mb-1">Example</h4>
            <p className="text-slate-800 italic">"{wordData.example}"</p>
          </div>
          <div className="text-center pt-4">
            <Button onClick={fetchWord} isLoading={isLoading}>
              Get New Word
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
};

export default VocabularyBuilder;
