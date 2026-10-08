import React, { useEffect, useState } from 'react';
import { fetchThreads, simulateThreadMapping } from '../services/api';
import { GitBranch, Server, RefreshCw } from 'lucide-react';

export const ThreadsPage: React.FC = () => {
  const [threads, setThreads] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('MANY_TO_MANY');
  const [userThreadCount, setUserThreadCount] = useState<number>(4);
  const [kernelThreadCount, setKernelThreadCount] = useState<number>(2);
  const [mappingResult, setMappingResult] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetchThreads();
      setThreads(res.threads || []);
      setWorkers(res.backgroundWorkers || []);
      handleSimulateMapping();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateMapping = async () => {
    try {
      const res = await simulateThreadMapping(selectedModel, userThreadCount, kernelThreadCount);
      setMappingResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-cyan-400" />
            <span>Thread Management & Concurrency Models</span>
          </h2>
          <p className="text-xs text-slate-400">User vs Kernel Threads, Multithreading Mapping Models & Background Workers</p>
        </div>
        <button
          onClick={loadData}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Multithreading Mapping Models Simulator */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Multithreading Mapping Model Simulator
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="text-[11px] text-slate-400 font-medium">Threading Model</label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
            >
              <option value="MANY_TO_ONE">Many-to-One</option>
              <option value="ONE_TO_ONE">One-to-One</option>
              <option value="MANY_TO_MANY">Many-to-Many</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium">User Threads (ULT)</label>
            <input
              type="number"
              min={1}
              max={8}
              value={userThreadCount}
              onChange={e => setUserThreadCount(Number(e.target.value))}
              className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-medium">Kernel Threads (KLT)</label>
            <input
              type="number"
              min={1}
              max={8}
              value={kernelThreadCount}
              onChange={e => setKernelThreadCount(Number(e.target.value))}
              className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSimulateMapping}
              className="w-full py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition"
            >
              Simulate Mapping
            </button>
          </div>
        </div>

        {mappingResult && (
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <p className="text-xs text-slate-300 font-medium">{mappingResult.description}</p>
            <div className="flex flex-wrap gap-3">
              {mappingResult.mappings.map((m: any, idx: number) => (
                <div key={idx} className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">{m.userThread}</span>
                  <span className="text-slate-500">➜</span>
                  <span className="text-emerald-400 font-bold">{m.kernelThread}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Background Workers & Thread Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Background Workers */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Active Background Workers</span>
          </h3>
          <div className="space-y-2">
            {workers.map(w => (
              <div key={w.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{w.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {w.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Runs: {w.executionCount} | Threads: {w.threadCount}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Threads Directory */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Thread Control Block (TCB) Directory
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-mono">
                <tr>
                  <th className="p-2.5">TID</th>
                  <th className="p-2.5">PID</th>
                  <th className="p-2.5">Name</th>
                  <th className="p-2.5">State</th>
                  <th className="p-2.5">ULT</th>
                  <th className="p-2.5">KLT</th>
                  <th className="p-2.5">CPU Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {threads.map(t => (
                  <tr key={t.tid} className="hover:bg-slate-800/40 transition">
                    <td className="p-2.5 font-bold text-cyan-400">{t.tid}</td>
                    <td className="p-2.5 text-slate-300">{t.pid}</td>
                    <td className="p-2.5 text-slate-200 font-sans">{t.name}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {t.state}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-400">{t.userThreadId}</td>
                    <td className="p-2.5 text-emerald-400">{t.kernelThreadId || 'N/A'}</td>
                    <td className="p-2.5 text-amber-400 font-bold">{t.cpuShare}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
