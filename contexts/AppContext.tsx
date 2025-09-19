import React, { createContext, useState, useContext, ReactNode } from 'react';
import { LearningLevel } from '../types';

interface AppContextType {
  learningLevel: LearningLevel;
  setLearningLevel: (level: LearningLevel) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [learningLevel, setLearningLevel] = useState<LearningLevel>('B2');

  return (
    <AppContext.Provider value={{ learningLevel, setLearningLevel }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};