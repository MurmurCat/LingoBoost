
import React, { useState, useEffect, useCallback } from 'react';
import { ReadingPassage, ReadingQuestion } from '../types';
import { getReadingPassage } from '../services/geminiService';
import Card from './ui/Card';
import Button from './ui/Button';
import FullPageSpinner from './ui/Spinner';

const ReadingComprehension: React.FC = () => {
  const [data, setData] = useState<ReadingPassage | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPassage = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setData(null);
    setUserAnswers([]);
    setIsSubmitted(false);
    try {
      const passageData = await getReadingPassage();
      setData(passageData);
      setUserAnswers(new Array(passageData.questions.length).fill(-1));
    } catch (err) {
      setError('Failed to fetch a reading passage. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPassage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };
  
  const getScore = () => {
    if (!data) return 0;
    return userAnswers.reduce((score, answer, index) => {
      return score + (answer === data.questions[index].correctAnswerIndex ? 1 : 0);
    }, 0);
  };

  if (isLoading) {
    return <Card><FullPageSpinner /></Card>;
  }

  if (error) {
    return (
        <Card>
            <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">
                <p>{error}</p>
                <Button onClick={fetchPassage} className="mt-4">Try Again</Button>
            </div>
        </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-1 text-slate-700">Reading Comprehension</h2>
      <p className="text-slate-500 mb-6">Read the passage and answer the questions that follow.</p>
      
      {data && (
        <div className="space-y-8">
          <article className="prose prose-slate max-w-none p-4 bg-slate-50 rounded-lg">
            <h3 className="text-xl font-semibold">{data.title}</h3>
            <p>{data.passage}</p>
          </article>

          <div className="space-y-6">
            {data.questions.map((q, qIndex) => (
              <div key={qIndex} className="p-4 border border-slate-200 rounded-lg">
                <p className="font-semibold mb-3">{qIndex + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((option, oIndex) => {
                    let optionClass = 'border-slate-300 hover:bg-slate-100';
                    if (isSubmitted) {
                      if (oIndex === q.correctAnswerIndex) {
                        optionClass = 'bg-green-100 border-green-400 text-green-800';
                      } else if (userAnswers[qIndex] === oIndex) {
                        optionClass = 'bg-red-100 border-red-400 text-red-800';
                      }
                    } else if (userAnswers[qIndex] === oIndex) {
                      optionClass = 'bg-blue-100 border-blue-400';
                    }
                    
                    return (
                      <button
                        key={oIndex}
                        onClick={() => handleAnswerSelect(qIndex, oIndex)}
                        disabled={isSubmitted}
                        className={`w-full text-left p-3 border rounded-lg transition-all ${optionClass}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!isSubmitted ? (
            <div className="text-center">
              <Button onClick={handleSubmit} disabled={userAnswers.includes(-1)}>
                Submit Answers
              </Button>
            </div>
          ) : (
            <div className="text-center p-4 bg-blue-50 rounded-lg space-y-4">
              <h3 className="text-xl font-bold">Your Score: {getScore()} / {data.questions.length}</h3>
              <Button onClick={fetchPassage} isLoading={isLoading}>
                Try Another Passage
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ReadingComprehension;
