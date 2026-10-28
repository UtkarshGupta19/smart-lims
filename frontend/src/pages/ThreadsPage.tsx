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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-600" />
            <span>Thread Management & Concurrency Models</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Simulated User vs Kernel Threads, Multithreading Mapping Models (ULT to KLT), and Background Workers
          </p>
        </div>
        <button
          onClick={loadData}
          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1.5 border border-slate-300 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Multithreading Mapping Models Simulator */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Multithreading Mapping Model Simulator
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrates how user-level threads (ULT) map to kernel-level threads (KLT) in operating systems.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-md border border-slate-200">
          <div>
            <label className="text-xs text-slate-700 font-medium">Threading Model</label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="w-full mt-1 bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="MANY_TO_ONE">Many-to-One (Green Threads)</option>
              <option value="ONE_TO_ONE">One-to-One (Linux / Windows NPTL)</option>
              <option value="MANY_TO_MANY">Many-to-Many (Two-Level Model)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-700 font-medium">User Threads (ULT)</label>
            <input
              type="number"
              min={1}
              max={8}
              value={userThreadCount}
              onChange={e => setUserThreadCount(Number(e.target.value))}
              className="w-full mt-1 bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-700 font-medium">Kernel Threads (KLT)</label>
            <input
              type="number"
              min={1}
              max={8}
              value={kernelThreadCount}
              onChange={e => setKernelThreadCount(Number(e.target.value))}
              className="w-full mt-1 bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSimulateMapping}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-xs transition shadow-sm"
            >
              Simulate Mapping
            </button>
          </div>
        </div>

        {mappingResult && (
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-3">
            <p className="text-xs text-slate-700 font-medium">{mappingResult.description}</p>
            <div className="flex flex-wrap gap-2">
              {mappingResult.mappings.map((m: any, idx: number) => (
                <div key={idx} className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-mono flex items-center gap-2 shadow-sm">
                  <span className="text-blue-700 font-bold">{m.userThread}</span>
                  <span className="text-slate-400">➜</span>
                  <span className="text-emerald-700 font-bold">{m.kernelThread}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Background Workers & Thread Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Background Workers */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-600" />
            <span>Active Background Workers</span>
          </h3>
          <div className="space-y-2">
            {workers.map(w => (
              <div key={w.id} className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{w.name}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {w.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Runs: {w.executionCount} | Threads: {w.threadCount}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Threads Directory */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Thread Control Block (TCB) Directory
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-medium">
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
              <tbody className="divide-y divide-slate-100 font-mono">
                {threads.map(t => (
                  <tr key={t.tid} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 font-bold text-blue-600">{t.tid}</td>
                    <td className="p-2.5 text-slate-600">{t.pid}</td>
                    <td className="p-2.5 text-slate-800 font-sans">{t.name}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {t.state}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-500">{t.userThreadId}</td>
                    <td className="p-2.5 text-emerald-700">{t.kernelThreadId || 'N/A'}</td>
                    <td className="p-2.5 text-slate-700 font-bold">{t.cpuShare}%</td>
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
