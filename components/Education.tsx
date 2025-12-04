import React, { useEffect, useState } from 'react';
import { AlertOctagon, TrendingUp, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchFraudCases } from '../services/geminiService';
import { FraudCase } from '../types';

const Education: React.FC = () => {
  const [cases, setCases] = useState<FraudCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const loadCases = async () => {
      const data = await fetchFraudCases();
      setCases(data);
      setLoading(false);
    };
    loadCases();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-6 max-w-md mx-auto w-full pb-24">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Fraud Intelligence</h2>
        <p className="text-slate-400 text-sm">
          Common tactics used by cybercriminals to target QR code users.
        </p>
      </div>

      <div className="mb-8 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Pattern Analysis
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          Most QR frauds (Quishing) share these traits:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li className="flex items-start"><span className="text-red-500 mr-2">!</span> <strong>Urgency:</strong> Demands immediate payment or action (e.g., "Parking expires in 5 mins").</li>
            <li className="flex items-start"><span className="text-red-500 mr-2">!</span> <strong>Overlay:</strong> Stickers placed physically over legitimate QR codes.</li>
            <li className="flex items-start"><span className="text-red-500 mr-2">!</span> <strong>Redirects:</strong> Shortened URLs used to hide the actual destination.</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Recent Case Studies</h3>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          cases.map((item) => (
            <div 
              key={item.id} 
              className={`bg-slate-900 rounded-xl overflow-hidden border transition-all duration-300 ${expandedId === item.id ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/10' : 'border-slate-800'}`}
            >
              <div 
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand(item.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-200 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500">{item.technique}</p>
                  </div>
                </div>
                {expandedId === item.id ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
              </div>
              
              {expandedId === item.id && (
                <div className="px-4 pb-4 pt-0 text-sm text-slate-400 bg-slate-900/50">
                  <div className="h-px w-full bg-slate-800 mb-4" />
                  <p className="mb-3">{item.description}</p>
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg mb-3">
                    <span className="text-xs font-semibold text-slate-500">Est. Loss</span>
                    <span className="text-red-400 font-mono font-bold">{item.lossAmount}</span>
                  </div>
                  <div className="flex items-start space-x-2 text-emerald-400 bg-emerald-950/30 p-3 rounded-lg">
                    <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="text-xs">{item.prevention}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Education;
