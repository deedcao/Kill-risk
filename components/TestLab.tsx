import React, { useState } from 'react';
import { FlaskConical, Bug, CheckCircle, XCircle, Play, RefreshCw, ShieldAlert, ArrowRight } from 'lucide-react';
import { analyzeString, fetchQuizQuestion } from '../services/geminiService';
import { RiskLevel, ScanResult, QuizQuestion } from '../types';

const TestLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sim' | 'quiz'>('sim');
  
  // Simulation State
  const [simResult, setSimResult] = useState<ScanResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Quiz State
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  const runSimulation = async (type: 'SAFE' | 'PHISHING' | 'MALWARE') => {
    setIsSimulating(true);
    setSimResult(null);
    
    let mockData = "";
    switch(type) {
      case 'SAFE': mockData = "https://www.wikipedia.org"; break;
      case 'PHISHING': mockData = "http://secure-login-paypal-verify.com.xyz/update"; break;
      case 'MALWARE': mockData = "http://freigames-download.net/installer.apk"; break;
    }

    try {
      const result = await analyzeString(mockData);
      setSimResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const loadQuiz = async () => {
    setQuizLoading(true);
    setSelectedOption(null);
    const q = await fetchQuizQuestion();
    setQuiz(q);
    setQuizLoading(false);
  };

  const getStatusColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.SAFE: return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
      case RiskLevel.WARNING: return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
      case RiskLevel.DANGER: return 'text-rose-500 border-rose-500/50 bg-rose-500/10';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto w-full pb-24 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
          <FlaskConical className="w-6 h-6 mr-2 text-purple-400" />
          Test Lab
        </h2>
        <p className="text-slate-400 text-sm">
          Verify system integrity and validate your security knowledge.
        </p>
      </div>

      <div className="flex p-1 bg-slate-900 rounded-xl mb-6 border border-slate-800">
        <button 
          onClick={() => setActiveTab('sim')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'sim' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
        >
          System Check
        </button>
        <button 
          onClick={() => { setActiveTab('quiz'); if(!quiz) loadQuiz(); }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'quiz' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
        >
          User Check
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'sim' ? (
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Run Diagnostic Simulation</h3>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => runSimulation('SAFE')}
                  className="flex items-center justify-between p-4 bg-slate-950 border border-emerald-900/30 rounded-xl hover:border-emerald-500/50 transition-colors group"
                >
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mr-3" />
                    <span className="text-slate-300 text-sm">Simulate Safe URL</span>
                  </div>
                  <Play className="w-4 h-4 text-slate-600 group-hover:text-emerald-500" />
                </button>

                <button 
                  onClick={() => runSimulation('PHISHING')}
                  className="flex items-center justify-between p-4 bg-slate-950 border border-amber-900/30 rounded-xl hover:border-amber-500/50 transition-colors group"
                >
                  <div className="flex items-center">
                    <ShieldAlert className="w-5 h-5 text-amber-500 mr-3" />
                    <span className="text-slate-300 text-sm">Simulate Phishing</span>
                  </div>
                  <Play className="w-4 h-4 text-slate-600 group-hover:text-amber-500" />
                </button>

                <button 
                  onClick={() => runSimulation('MALWARE')}
                  className="flex items-center justify-between p-4 bg-slate-950 border border-rose-900/30 rounded-xl hover:border-rose-500/50 transition-colors group"
                >
                  <div className="flex items-center">
                    <Bug className="w-5 h-5 text-rose-500 mr-3" />
                    <span className="text-slate-300 text-sm">Simulate Malware APK</span>
                  </div>
                  <Play className="w-4 h-4 text-slate-600 group-hover:text-rose-500" />
                </button>
              </div>
            </div>

            {isSimulating && (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
                <p className="text-xs text-cyan-500 font-mono">Running Heuristic Analysis...</p>
              </div>
            )}

            {!isSimulating && simResult && (
              <div className={`rounded-2xl p-5 border animate-in fade-in slide-in-from-bottom-2 ${getStatusColor(simResult.riskLevel)}`}>
                 <div className="flex justify-between items-start mb-2">
                   <h4 className="font-bold text-lg">{simResult.riskLevel} DETECTED</h4>
                 </div>
                 <p className="font-mono text-xs opacity-70 mb-3 break-all">{simResult.content}</p>
                 <p className="text-sm font-medium mb-2">{simResult.summary}</p>
                 <ul className="text-xs space-y-1 opacity-90">
                   {simResult.reasoning.map((r, i) => <li key={i}>• {r}</li>)}
                 </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {quizLoading ? (
               <div className="flex-1 flex flex-col items-center justify-center">
                 <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mb-4" />
                 <p className="text-slate-500 text-sm">Generating Scenario...</p>
               </div>
            ) : quiz ? (
              <div className="space-y-6">
                <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-bold text-purple-400 uppercase mb-2 block">Scenario</span>
                  <p className="text-white font-medium text-lg leading-snug">{quiz.question}</p>
                </div>

                <div className="space-y-3">
                  {quiz.options.map((option, idx) => (
                    <button
                      key={idx}
                      disabled={selectedOption !== null}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full p-4 rounded-xl text-left transition-all border ${
                        selectedOption === null 
                          ? 'bg-slate-950 border-slate-800 hover:border-purple-500/50' 
                          : selectedOption === idx
                            ? idx === quiz.correctIndex 
                              ? 'bg-emerald-500/20 border-emerald-500' 
                              : 'bg-rose-500/20 border-rose-500'
                            : idx === quiz.correctIndex
                              ? 'bg-emerald-500/20 border-emerald-500'
                              : 'bg-slate-950 border-slate-800 opacity-50'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                           selectedOption === idx 
                           ? (idx === quiz.correctIndex ? 'border-emerald-500 text-emerald-500' : 'border-rose-500 text-rose-500')
                           : 'border-slate-600 text-slate-600'
                        }`}>
                          {idx === 0 ? 'A' : idx === 1 ? 'B' : 'C'}
                        </div>
                        <span className="text-sm text-slate-200">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedOption !== null && (
                  <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className={`p-4 rounded-xl mb-4 ${selectedOption === quiz.correctIndex ? 'bg-emerald-950/30 border border-emerald-900' : 'bg-rose-950/30 border border-rose-900'}`}>
                      <h4 className={`font-bold mb-1 ${selectedOption === quiz.correctIndex ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {selectedOption === quiz.correctIndex ? 'Correct Analysis!' : 'Risk Detected!'}
                      </h4>
                      <p className="text-sm text-slate-300">{quiz.explanation}</p>
                    </div>
                    <button 
                      onClick={loadQuiz}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center"
                    >
                      Next Scenario <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center mt-20">
                <p className="text-slate-500">Press User Check to start.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestLab;