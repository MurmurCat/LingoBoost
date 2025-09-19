
import React from 'react';
import { LogoIcon } from './icons/Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4">
        <div className="flex items-center gap-3">
          <LogoIcon />
          <h1 className="text-2xl font-bold text-slate-800">
            LingoBoost <span className="text-blue-500">AI</span>
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
