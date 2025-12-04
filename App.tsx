import React, { useState } from 'react';
import { ScanLine, BookOpen, Shield, FlaskConical } from 'lucide-react';
import Scanner from './components/Scanner';
import Education from './components/Education';
import TestLab from './components/TestLab';
import { AppView } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.SCANNER);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">SecureQR</span>
        </div>
        <div className="text-xs font-mono text-cyan-500 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-500/20">
          v1.0.0
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        {view === AppView.SCANNER && <Scanner />}
        {view === AppView.EDUCATION && <Education />}
        {view === AppView.TEST_LAB && <TestLab />}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-20 bg-slate-950 border-t border-white/5 flex items-center justify-around px-6 pb-2 safe-area-bottom">
        <button 
          onClick={() => setView(AppView.SCANNER)}
          className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${view === AppView.SCANNER ? 'text-cyan-400' : 'text-slate-600 hover:text-slate-400'}`}
        >
          <ScanLine className={`w-6 h-6 ${view === AppView.SCANNER ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : ''}`} />
          <span className="text-[10px] font-medium">Scan</span>
        </button>

        <button 
          onClick={() => setView(AppView.EDUCATION)}
          className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${view === AppView.EDUCATION ? 'text-cyan-400' : 'text-slate-600 hover:text-slate-400'}`}
        >
          <BookOpen className={`w-6 h-6 ${view === AppView.EDUCATION ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : ''}`} />
          <span className="text-[10px] font-medium">Learn</span>
        </button>

        <button 
          onClick={() => setView(AppView.TEST_LAB)}
          className={`flex flex-col items-center justify-center space-y-1 w-16 transition-colors ${view === AppView.TEST_LAB ? 'text-purple-400' : 'text-slate-600 hover:text-slate-400'}`}
        >
          <FlaskConical className={`w-6 h-6 ${view === AppView.TEST_LAB ? 'drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]' : ''}`} />
          <span className="text-[10px] font-medium">Verify</span>
        </button>
      </nav>
    </div>
  );
};

export default App;