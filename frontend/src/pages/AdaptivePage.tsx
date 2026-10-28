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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-blue-600" />
            <span>Adaptive Resource Intelligence Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic Rule-Based OS Bottleneck Detection & Explainable Decision Tree
          </p>
        </div>

        <button
          onClick={loadHistory}
          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 border border-slate-300 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Decisions</span>
        </button>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="bg-white p-8 text-center text-xs text-slate-500 rounded-lg border border-slate-200 shadow-sm">
            No adaptive decisions recorded yet. Run a scenario or simulation to populate decision log.
          </div>
        ) : (
          history.map(dec => (
            <div key={dec.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 font-mono">
                  <span>{dec.id}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">{new Date(dec.timestamp).toLocaleTimeString()}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-medium border ${
                  dec.bottleneck === 'DEADLOCK' || dec.bottleneck === 'MEMORY'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  Bottleneck: {dec.bottleneck}
                </span>
              </div>

              <div className="text-sm font-semibold text-slate-900">{dec.decision}</div>
              <p className="text-xs text-slate-600">{dec.reason}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs font-mono">
                <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Recommended Algorithm:</span>
                  <span className="text-blue-700 font-bold">{dec.algorithmRecommended}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Action Executed:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
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
