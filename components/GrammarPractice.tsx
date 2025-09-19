
import React, { useState, useEffect, useCallback } from 'react';
import { GrammarExercise } from '../types';
import { getGrammarExercise } from '../services/geminiService';
import Card from './ui/Card';
import Button from './ui/Button';
import FullPageSpinner from './ui/Spinner';

const GrammarPractice: React.FC = () => {
  const [exercise, setExercise] = useState<GrammarExercise | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<{ message: string, type: 'correct' | 'incorrect' } | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercise = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setExercise(null);
    setUserInput('');
    setFeedback(null);
    setShowAnswer(false);
    try {
      const data = await getGrammarExercise();
      setExercise(data);
    } catch (err) {
      setError('Failed to fetch a grammar exercise. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExercise();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleCheckAnswer = () => {
    if (!exercise) return;
    const isCorrect = userInput.trim().toLowerCase() === exercise.correctSentence.trim().toLowerCase();
    if (isCorrect) {
      setFeedback({ message: 'Excellent! That\'s correct.', type: 'correct' });
      setShowAnswer(true);
    } else {
      setFeedback({ message: 'Not quite. Give it another try or reveal the answer.', type: 'incorrect' });
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };
  
  if (isLoading) {
    return <Card><FullPageSpinner /></Card>;
  }

  if (error) {
    return (
        <Card>
            <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">
                <p>{error}</p>
                <Button onClick={fetchExercise} className="mt-4">Try Again</Button>
            </div>
        </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-1 text-slate-700">Grammar Practice</h2>
      <p className="text-slate-500 mb-6">Find and fix the mistake in the sentence below.</p>
      
      {exercise && (
        <div className="space-y-4">
          <div>
            <label className="font-semibold text-slate-600 mb-2 block">Incorrect Sentence:</label>
            <p className="p-4 bg-red-50 text-red-800 rounded-lg italic">"{exercise.incorrectSentence}"</p>
          </div>
          
          <div>
            <label htmlFor="user-input" className="font-semibold text-slate-600 mb-2 block">Your Correction:</label>
            <textarea
              id="user-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
              rows={2}
              placeholder="Rewrite the correct sentence here..."
              disabled={showAnswer}
            />
          </div>

          {feedback && !showAnswer && (
            <div className={`p-3 rounded-lg ${feedback.type === 'correct' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {feedback.message}
            </div>
          )}
          
          {!showAnswer && (
            <div className="flex flex-wrap gap-4 pt-2">
              <Button onClick={handleCheckAnswer}>Check Answer</Button>
              <Button onClick={handleShowAnswer} variant="secondary">Show Answer</Button>
            </div>
          )}
          
          {showAnswer && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div>
                <h4 className="font-semibold text-slate-600 mb-1">Correct Sentence:</h4>
                <p className="p-4 bg-green-50 text-green-800 rounded-lg italic">"{exercise.correctSentence}"</p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-600 mb-1">Explanation:</h4>
                <p className="p-4 bg-blue-50 text-blue-800 rounded-lg">{exercise.explanation}</p>
              </div>
            </div>
          )}
          
          <div className="text-center pt-6">
            <Button onClick={fetchExercise} isLoading={isLoading}>
              Next Exercise
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default GrammarPractice;
