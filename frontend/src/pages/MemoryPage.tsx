import { useState } from 'react';
import { allocateMemory, runPageReplacement, fetchBelady } from '../services/api';
import { HardDrive, Play, AlertTriangle } from 'lucide-react';

export const MemoryPage = () => {
  const [activeTab, setActiveTab] = useState<'contiguous' | 'paging' | 'belady'>('contiguous');
  const [partitionResult, setPartitionResult] = useState<any>(null);
  const [pageResult, setPageResult] = useState<any>(null);
  const [beladyResult, setBeladyResult] = useState<any>(null);

  const handleRunPartitions = async (algo: string) => setPartitionResult(await allocateMemory(algo));
  const handleRunPageRepl = async (algo: string) => setPageResult(await runPageReplacement(algo));
  const handleRunBelady = async () => setBeladyResult(await fetchBelady());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <HardDrive className="w-6 h-6 text-cyan-400" />
          <span>Memory & Virtual Memory Engine</span>
        </h2>
        <p className="text-xs text-slate-400">Contiguous Partitions, Paging, Page Replacement Algorithms, Belady's Anomaly & Thrashing</p>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button onClick={() => setActiveTab('contiguous')} className={`px-4 py-2 rounded-xl text-xs font-semibold ${activeTab === 'contiguous' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400'}`}>1. Contiguous Partitions</button>
        <button onClick={() => setActiveTab('paging')} className={`px-4 py-2 rounded-xl text-xs font-semibold ${activeTab === 'paging' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400'}`}>2. Page Replacement (Demand Paging)</button>
        <button onClick={() => setActiveTab('belady')} className={`px-4 py-2 rounded-xl text-xs font-semibold ${activeTab === 'belady' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400'}`}>3. Belady's Anomaly Demo</button>
      </div>

      {activeTab === 'contiguous' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Contiguous Memory Allocation</h3>
            <div className="flex gap-2">
              <button onClick={() => handleRunPartitions('FIRST_FIT')} className="px-3 py-1.5 bg-slate-800 text-cyan-400 text-xs rounded-lg font-semibold border border-slate-700">First Fit</button>
              <button onClick={() => handleRunPartitions('BEST_FIT')} className="px-3 py-1.5 bg-slate-800 text-cyan-400 text-xs rounded-lg font-semibold border border-slate-700">Best Fit</button>
              <button onClick={() => handleRunPartitions('WORST_FIT')} className="px-3 py-1.5 bg-slate-800 text-cyan-400 text-xs rounded-lg font-semibold border border-slate-700">Worst Fit</button>
            </div>
          </div>

          {partitionResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-6 text-xs font-mono">
                <span className="text-slate-400">Total Internal Frag: <strong className="text-rose-400">{partitionResult.totalInternalFragmentation}MB</strong></span>
                <span className="text-slate-400">Total External Frag: <strong className="text-amber-400">{partitionResult.totalExternalFragmentation}MB</strong></span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {partitionResult.partitions.map((p: any) => (
                  <div key={p.id} className={`p-4 rounded-xl border ${p.allocatedProcessId ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                    <div className="text-xs font-bold font-mono">Partition #{p.id} ({p.size}MB)</div>
                    <div className="text-[11px] mt-1 font-semibold">{p.allocatedProcessId ? `Process ${p.allocatedProcessId}` : 'FREE'}</div>
                    {p.allocatedProcessId && <div className="text-[10px] text-slate-400 font-mono mt-1">Frag: {p.internalFragmentation}MB</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'paging' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Page Replacement Simulator</h3>
            <div className="flex gap-2">
              <button onClick={() => handleRunPageRepl('FIFO')} className="px-3 py-1.5 bg-slate-800 text-cyan-400 text-xs rounded-lg font-semibold border border-slate-700">FIFO</button>
              <button onClick={() => handleRunPageRepl('LRU')} className="px-3 py-1.5 bg-slate-800 text-cyan-400 text-xs rounded-lg font-semibold border border-slate-700">LRU</button>
              <button onClick={() => handleRunPageRepl('OPTIMAL')} className="px-3 py-1.5 bg-slate-800 text-cyan-400 text-xs rounded-lg font-semibold border border-slate-700">Optimal</button>
              <button onClick={() => handleRunPageRepl('LFU')} className="px-3 py-1.5 bg-slate-800 text-cyan-400 text-xs rounded-lg font-semibold border border-slate-700">LFU</button>
            </div>
          </div>

          {pageResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-6 text-xs font-mono">
                <span className="text-slate-400">Algorithm: <strong className="text-cyan-400">{pageResult.algorithm}</strong></span>
                <span className="text-slate-400">Page Faults: <strong className="text-rose-400">{pageResult.pageFaultCount}</strong></span>
                <span className="text-slate-400">Page Fault Rate: <strong className="text-amber-400">{pageResult.pageFaultRate}%</strong></span>
                <span className="text-slate-400">Hits: <strong className="text-emerald-400">{pageResult.hitCount}</strong></span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 font-mono text-center text-xs">
                {pageResult.steps.map((st: any) => (
                  <div key={st.step} className={`p-2 rounded-xl border ${st.isPageFault ? 'bg-rose-500/10 border-rose-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                    <div className="text-slate-400 text-[10px]">Req: {st.pageRequested}</div>
                    <div className="font-bold text-white mt-1">[{st.frames.map((f: any) => (f !== null ? f : '-')).join(',')}]</div>
                    <div className={`text-[9px] mt-1 font-bold ${st.isPageFault ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {st.isPageFault ? 'FAULT' : 'HIT'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'belady' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Belady's Anomaly Visualizer</h3>
            <button onClick={handleRunBelady} className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg text-xs">
              Demonstrate Anomaly
            </button>
          </div>

          {beladyResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-bold uppercase">FIFO with 3 Frames</div>
                  <div className="text-3xl font-bold font-mono text-cyan-400 mt-1">{beladyResult.frame3Faults} Faults</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-bold uppercase">FIFO with 4 Frames</div>
                  <div className="text-3xl font-bold font-mono text-rose-400 mt-1">{beladyResult.frame4Faults} Faults</div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl text-xs text-amber-300 font-mono flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <strong>Belady's Anomaly Confirmed:</strong>
                  <div className="mt-1">{beladyResult.explanation}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
