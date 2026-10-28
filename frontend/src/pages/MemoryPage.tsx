import React, { useEffect, useState } from 'react';
import {
  fetchDynamicMemoryState,
  allocateDynamicMemory,
  deallocateDynamicMemory,
  resetDynamicMemory,
  allocateMemory,
  runPageReplacement,
  fetchBelady,
} from '../services/api';
import { DynamicMemoryState } from '../types';
import {
  HardDrive,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Trash2,
  Sliders,
} from 'lucide-react';

export const MemoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dynamic' | 'partitions' | 'paging' | 'belady'>('dynamic');

  // Dynamic Block Memory State
  const [dynamicState, setDynamicState] = useState<DynamicMemoryState | null>(null);
  const [allocPid, setAllocPid] = useState<string>('P103');
  const [allocName, setAllocName] = useState<string>('CAD Circuit Solver');
  const [allocSize, setAllocSize] = useState<number>(180);
  const [allocStrategy, setAllocStrategy] = useState<'FIRST_FIT' | 'BEST_FIT' | 'WORST_FIT'>('FIRST_FIT');
  const [allocFeedback, setAllocFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Other tabs state
  const [partitionResult, setPartitionResult] = useState<any>(null);
  const [pageResult, setPageResult] = useState<any>(null);
  const [beladyResult, setBeladyResult] = useState<any>(null);

  useEffect(() => {
    loadDynamicState();
  }, []);

  const loadDynamicState = async () => {
    try {
      const data = await fetchDynamicMemoryState();
      setDynamicState(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAllocateDynamic = async (e: React.FormEvent) => {
    e.preventDefault();
    setAllocFeedback(null);
    try {
      const res = await allocateDynamicMemory(allocPid, allocName, allocSize, allocStrategy);
      if (res.success) {
        setAllocFeedback({ success: true, message: res.reason });
        setDynamicState(res.memoryState);
      } else {
        setAllocFeedback({ success: false, message: res.reason });
      }
    } catch (err: any) {
      setAllocFeedback({ success: false, message: err.message || 'Allocation failed' });
    }
  };

  const handleDeallocateDynamic = async (pidOrBlockId: string) => {
    try {
      const res = await deallocateDynamicMemory(pidOrBlockId);
      if (res.success) {
        setAllocFeedback({ success: true, message: res.reason });
        setDynamicState(res.memoryState);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDynamic = async () => {
    if (!window.confirm('Reset dynamic memory to initial sample layout?')) return;
    try {
      const res = await resetDynamicMemory(1024);
      setDynamicState(res);
      setAllocFeedback({ success: true, message: 'Memory reset to default layout (1024 MB total).' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunPartitions = async (algo: string) => {
    setPartitionResult(await allocateMemory(algo));
  };

  const handleRunPageRepl = async (algo: string) => {
    setPageResult(await runPageReplacement(algo));
  };

  const handleRunBelady = async () => {
    setBeladyResult(await fetchBelady());
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-600" />
            <span>Memory Management & Virtual Memory Simulator</span>
          </h2>
          <p className="text-xs text-slate-500">
            Dynamic variable-partition allocation, deallocation, block coalescing, fragmentation & demand paging
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('dynamic')}
          className={`px-3 py-1.5 rounded-md font-semibold transition ${
            activeTab === 'dynamic' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          1. Dynamic Memory Allocator & Visual Map
        </button>
        <button
          onClick={() => setActiveTab('partitions')}
          className={`px-3 py-1.5 rounded-md font-semibold transition ${
            activeTab === 'partitions' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          2. Fixed Partitions Benchmark
        </button>
        <button
          onClick={() => setActiveTab('paging')}
          className={`px-3 py-1.5 rounded-md font-semibold transition ${
            activeTab === 'paging' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          3. Page Replacement (Demand Paging)
        </button>
        <button
          onClick={() => setActiveTab('belady')}
          className={`px-3 py-1.5 rounded-md font-semibold transition ${
            activeTab === 'belady' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          4. Belady's Anomaly Demo
        </button>
      </div>

      {/* 1. Dynamic Memory Allocator & Visual Map */}
      {activeTab === 'dynamic' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          {dynamicState && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
              <div className="p-3 bg-white rounded border border-slate-200 shadow-sm">
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Total Memory</span>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{dynamicState.totalMemoryMB} MB</div>
              </div>
              <div className="p-3 bg-white rounded border border-slate-200 shadow-sm">
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Allocated RAM</span>
                <div className="text-lg font-bold font-mono text-blue-700 mt-0.5">{dynamicState.allocatedMemoryMB} MB</div>
              </div>
              <div className="p-3 bg-white rounded border border-slate-200 shadow-sm">
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Total Free Space</span>
                <div className="text-lg font-bold font-mono text-emerald-700 mt-0.5">{dynamicState.freeMemoryMB} MB</div>
              </div>
              <div className="p-3 bg-white rounded border border-slate-200 shadow-sm">
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Largest Free Block</span>
                <div className="text-lg font-bold font-mono text-slate-800 mt-0.5">{dynamicState.largestFreeBlockMB} MB</div>
              </div>
              <div className="p-3 bg-white rounded border border-slate-200 shadow-sm">
                <span className="text-slate-500 uppercase font-semibold text-[10px]">External Fragmentation</span>
                <div className={`text-lg font-bold font-mono mt-0.5 ${dynamicState.externalFragmentationMB > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
                  {dynamicState.externalFragmentationMB} MB
                </div>
              </div>
            </div>
          )}

          {/* Visual Memory Map */}
          {dynamicState && (
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Physical Address Space Visualization (Continuous Memory Map)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Contiguous memory from 0 MB to {dynamicState.totalMemoryMB} MB showing processes and free holes
                  </p>
                </div>
                <button
                  onClick={handleResetDynamic}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded text-xs font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Layout</span>
                </button>
              </div>

              {/* Continuous Horizontal Memory Bar */}
              <div className="flex h-16 bg-slate-100 rounded border border-slate-300 p-1 gap-1 overflow-x-auto shadow-inner">
                {dynamicState.blocks.map(block => {
                  const widthPercent = (block.size / dynamicState.totalMemoryMB) * 100;
                  const isFree = block.isFree;

                  return (
                    <div
                      key={block.id}
                      style={{ flex: block.size, minWidth: `${Math.max(45, (block.size / dynamicState.totalMemoryMB) * 500)}px` }}
                      className={`h-full border rounded flex flex-col items-center justify-center relative p-1 transition ${
                        isFree
                          ? 'bg-emerald-50 border-dashed border-emerald-400 text-emerald-800'
                          : block.pid === 'OS-KERNEL'
                          ? 'bg-slate-200 border-slate-400 text-slate-900'
                          : 'bg-blue-100 border-blue-400 text-blue-950 font-semibold'
                      }`}
                      title={`${block.id}: ${block.isFree ? 'FREE HOLE' : block.processName} (${block.size} MB) [${block.startAddress}MB - ${block.startAddress + block.size}MB]`}
                    >
                      <span className="text-[11px] font-bold font-mono truncate max-w-full">
                        {isFree ? 'FREE' : block.pid}
                      </span>
                      <span className="text-[10px] text-slate-600 font-mono">{block.size} MB</span>
                      <span className="text-[9px] text-slate-400 font-mono">@{block.startAddress}M</span>
                    </div>
                  );
                })}
              </div>

              {/* Memory Blocks Details & Deallocation List */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs lab-table">
                  <thead>
                    <tr>
                      <th>Block ID</th>
                      <th>Address Range</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Process</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {dynamicState.blocks.map(block => (
                      <tr key={block.id}>
                        <td className="font-bold text-blue-700">{block.id}</td>
                        <td>{block.startAddress} MB – {block.startAddress + block.size} MB</td>
                        <td>{block.size} MB</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            block.isFree ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-900'
                          }`}>
                            {block.isFree ? 'FREE HOLE' : 'ALLOCATED'}
                          </span>
                        </td>
                        <td className="font-sans">
                          {block.isFree ? (
                            <span className="text-slate-400 italic">Available Memory</span>
                          ) : (
                            <span className="text-slate-800">
                              <strong>{block.pid}</strong>: {block.processName}
                            </span>
                          )}
                        </td>
                        <td>
                          {!block.isFree && block.pid !== 'OS-KERNEL' && (
                            <button
                              onClick={() => handleDeallocateDynamic(block.id)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded text-[10px] font-medium transition flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Free / Coalesce</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Dynamic Allocation Form */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Allocate Process to Memory</span>
            </h3>

            <form onSubmit={handleAllocateDynamic} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Process PID</label>
                <input
                  type="text"
                  value={allocPid}
                  onChange={e => setAllocPid(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Process Name</label>
                <input
                  type="text"
                  value={allocName}
                  onChange={e => setAllocName(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Memory Size (MB)</label>
                <input
                  type="number"
                  min={16}
                  value={allocSize}
                  onChange={e => setAllocSize(Number(e.target.value))}
                  required
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Placement Strategy</label>
                <select
                  value={allocStrategy}
                  onChange={e => setAllocStrategy(e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                >
                  <option value="FIRST_FIT">First Fit</option>
                  <option value="BEST_FIT">Best Fit</option>
                  <option value="WORST_FIT">Worst Fit</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition"
                >
                  Allocate Block
                </button>
              </div>
            </form>

            {allocFeedback && (
              <div
                className={`p-3 rounded border text-xs flex items-start gap-2 ${
                  allocFeedback.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                {allocFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="block font-semibold">
                    {allocFeedback.success ? 'Allocation Granted' : 'Allocation Rejected'}
                  </strong>
                  <span className="text-[11px] leading-relaxed">{allocFeedback.message}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Fixed Partitions Benchmark */}
      {activeTab === 'partitions' && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Fixed Partition Allocation Comparison</h3>
              <p className="text-xs text-slate-500">Benchmark First Fit, Best Fit, and Worst Fit algorithms on identical partitions</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleRunPartitions('FIRST_FIT')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold border border-slate-300">First Fit</button>
              <button onClick={() => handleRunPartitions('BEST_FIT')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold border border-slate-300">Best Fit</button>
              <button onClick={() => handleRunPartitions('WORST_FIT')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold border border-slate-300">Worst Fit</button>
            </div>
          </div>

          {partitionResult && (
            <div className="space-y-4 text-xs font-mono">
              <div className="flex items-center gap-6">
                <span>Total Internal Fragmentation: <strong className="text-rose-700">{partitionResult.totalInternalFragmentation} MB</strong></span>
                <span>Total External Fragmentation: <strong className="text-amber-700">{partitionResult.totalExternalFragmentation} MB</strong></span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {partitionResult.partitions.map((p: any) => (
                  <div key={p.id} className={`p-3 rounded border ${p.allocatedProcessId ? 'bg-blue-50 border-blue-300 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    <div className="font-bold">Partition #{p.id} ({p.size} MB)</div>
                    <div className="text-[11px] mt-1 font-semibold">{p.allocatedProcessId ? `Process ${p.allocatedProcessId}` : 'FREE'}</div>
                    {p.allocatedProcessId && <div className="text-[10px] text-slate-500 mt-1">Internal Frag: {p.internalFragmentation} MB</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Page Replacement (Demand Paging) */}
      {activeTab === 'paging' && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Virtual Memory Page Replacement Simulator</h3>
              <p className="text-xs text-slate-500">Track page faults and hits across 3 memory frames for reference string [7,0,1,2,0,3,0,4...]</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleRunPageRepl('FIFO')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold border border-slate-300">FIFO</button>
              <button onClick={() => handleRunPageRepl('LRU')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold border border-slate-300">LRU</button>
              <button onClick={() => handleRunPageRepl('OPTIMAL')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold border border-slate-300">Optimal</button>
              <button onClick={() => handleRunPageRepl('LFU')} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold border border-slate-300">LFU</button>
            </div>
          </div>

          {pageResult && (
            <div className="space-y-4 text-xs font-mono">
              <div className="flex flex-wrap items-center gap-6">
                <span>Algorithm: <strong className="text-blue-700">{pageResult.algorithm}</strong></span>
                <span>Page Faults: <strong className="text-rose-700">{pageResult.pageFaultCount}</strong></span>
                <span>Fault Rate: <strong className="text-amber-700">{pageResult.pageFaultRate}%</strong></span>
                <span>Page Hits: <strong className="text-emerald-700">{pageResult.hitCount}</strong></span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 text-center">
                {pageResult.steps.map((st: any) => (
                  <div key={st.step} className={`p-2 rounded border ${st.isPageFault ? 'bg-rose-50 border-rose-300' : 'bg-emerald-50 border-emerald-300'}`}>
                    <div className="text-slate-500 text-[10px]">Req: {st.pageRequested}</div>
                    <div className="font-bold text-slate-900 mt-1">[{st.frames.map((f: any) => (f !== null ? f : '-')).join(',')}]</div>
                    <div className={`text-[9px] mt-1 font-bold ${st.isPageFault ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {st.isPageFault ? 'FAULT' : 'HIT'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Belady's Anomaly Demo */}
      {activeTab === 'belady' && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Belady’s Anomaly Demonstration</h3>
              <p className="text-xs text-slate-500">Proves that increasing page frame allocation under FIFO can paradoxically increase page faults</p>
            </div>
            <button onClick={handleRunBelady} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold">
              Demonstrate Anomaly
            </button>
          </div>

          {beladyResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold uppercase">FIFO with 3 Frames</div>
                  <div className="text-2xl font-bold font-mono text-blue-700 mt-1">{beladyResult.frame3Faults} Page Faults</div>
                </div>
                <div className="bg-slate-50 p-4 rounded border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold uppercase">FIFO with 4 Frames</div>
                  <div className="text-2xl font-bold font-mono text-rose-700 mt-1">{beladyResult.frame4Faults} Page Faults</div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Belady’s Anomaly Confirmed: </strong>
                  <span className="leading-relaxed">{beladyResult.explanation}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
