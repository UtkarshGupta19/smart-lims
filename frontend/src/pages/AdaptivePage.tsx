import React, { useEffect, useState } from 'react';
import { AdaptiveDecision } from '../types';
import { fetchAdaptiveHistory } from '../services/api';
import { BrainCircuit, RefreshCw, CheckCircle2 } from 'lucide-react';

export const AdaptivePage: React.FC = () => {
  const [history, setHistory] = useState<AdaptiveDecision[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await fetchAdaptiveHistory();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-cyan-400" />
            <span>Adaptive Resource Intelligence Engine</span>
          </h2>
          <p className="text-xs text-slate-400">Deterministic Rule-Based OS Bottleneck Detection & Explainable Decision Tree</p>
        </div>

        <button
          onClick={loadHistory}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Decisions</span>
        </button>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="glass-panel p-8 text-center text-xs text-slate-500 rounded-2xl">
            No adaptive decisions recorded yet. Run a scenario or simulation to populate decision log!
          </div>
        ) : (
          history.map(dec => (
            <div key={dec.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 font-mono">
                  <span>{dec.id}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{new Date(dec.timestamp).toLocaleTimeString()}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  dec.bottleneck === 'DEADLOCK' || dec.bottleneck === 'MEMORY' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}>
                  Bottleneck: {dec.bottleneck}
                </span>
              </div>

              <div className="text-sm font-bold text-white">{dec.decision}</div>
              <p className="text-xs text-slate-300">{dec.reason}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/60 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Recommended Algorithm:</span>
                  <span className="text-cyan-300 font-bold">{dec.algorithmRecommended}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Action Executed:</span>
                  <span className="text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{dec.actionTaken}</span>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
