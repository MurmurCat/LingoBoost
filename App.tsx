
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import VocabularyBuilder from './components/VocabularyBuilder';
import GrammarPractice from './components/GrammarPractice';
import ReadingComprehension from './components/ReadingComprehension';
import ConversationPractice from './components/ConversationPractice';
import VocabularyCourse from './components/VocabularyCourse';
import { Section } from './types';
import { BookIcon, ChatIcon, GrammarIcon, NewspaperIcon, AcademicCapIcon } from './components/icons/Icons';
import { AppProvider } from './contexts/AppContext';
import LevelSelector from './components/LevelSelector';

const MainApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('vocabulary');

  const renderSection = () => {
    switch (activeSection) {
      case 'vocabulary':
        return <VocabularyBuilder />;
      case 'vocabularyCourse':
        return <VocabularyCourse />;
      case 'grammar':
        return <GrammarPractice />;
      case 'reading':
        return <ReadingComprehension />;
      case 'conversation':
        return <ConversationPractice />;
      default:
        return <VocabularyBuilder />;
    }
  };
  
  const navItems = useMemo(() => [
    { id: 'vocabulary', label: 'Vocabulary', icon: <BookIcon /> },
    { id: 'vocabularyCourse', label: 'Vocabulary Course', icon: <AcademicCapIcon /> },
    { id: 'grammar', label: 'Grammar', icon: <GrammarIcon /> },
    { id: 'reading', label: 'Reading', icon: <NewspaperIcon /> },
    { id: 'conversation', label: 'Chat', icon: <ChatIcon /> },
  ], []);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Header />
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <LevelSelector />
              <nav className="bg-white rounded-xl shadow-md p-4">
                <ul className="space-y-2">
                  {navItems.map(item => (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveSection(item.id as Section)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ease-in-out ${
                          activeSection === item.id
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                        }`}
                      >
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>
          <div className="lg:col-span-3">
            {renderSection()}
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};


export default App;