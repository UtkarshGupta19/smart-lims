import { useState } from 'react';
import {
  runRaceConditionSim,
  runCriticalSectionAlgo,
  runBoundedBuffer,
  runDiningPhilosophers,
  runReadersWriters,
  runSleepingBarber,
} from '../services/api';
import { Repeat, Play, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ConcurrencyPage = () => {
  const [activeSubTab, setActiveSubTab] = useState<'race' | 'cs' | 'producer' | 'philosophers' | 'rw' | 'barber'>('race');
  const [raceResult, setRaceResult] = useState<any>(null);
  const [csResult, setCsResult] = useState<any[]>([]);
  const [bufferResult, setBufferResult] = useState<any[]>([]);
  const [philsResult, setPhilsResult] = useState<any[]>([]);
  const [rwResult, setRwResult] = useState<any[]>([]);
  const [barberResult, setBarberResult] = useState<any[]>([]);

  const handleRunRace = async () => setRaceResult(await runRaceConditionSim());
  const handleRunCS = async (algo: string) => setCsResult(await runCriticalSectionAlgo(algo));
  const handleRunProducer = async () => setBufferResult(await runBoundedBuffer(4, 6));
  const handleRunPhilosophers = async () => setPhilsResult(await runDiningPhilosophers());
  const handleRunRW = async () => setRwResult(await runReadersWriters());
  const handleRunBarber = async () => setBarberResult(await runSleepingBarber());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Repeat className="w-6 h-6 text-cyan-400" />
          <span>Concurrency & Synchronization Simulation Engine</span>
        </h2>
        <p className="text-xs text-slate-400">Race Conditions, Critical Section Algorithms & Classical IPC Problems</p>
      </div>

      {/* Subtab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'race', label: '1. Race Condition' },
          { id: 'cs', label: '2. Critical Section Algos' },
          { id: 'producer', label: '3. Producer-Consumer' },
          { id: 'philosophers', label: '4. Dining Philosophers' },
          { id: 'rw', label: '5. Readers-Writers' },
          { id: 'barber', label: '6. Sleeping Barber' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeSubTab === tab.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Race Condition */}
      {activeSubTab === 'race' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Simulate Race Condition vs Mutex Protection</h3>
            <button
              onClick={handleRunRace}
              className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Conflict</span>
            </button>
          </div>

          {raceResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl">
                  <div className="text-xs text-rose-400 font-bold uppercase">Without Lock (Lost Update)</div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">{raceResult.noLockFinalBalance}</div>
                  <div className="text-[10px] text-rose-300 mt-1">Data corrupted due to race condition!</div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
                  <div className="text-xs text-emerald-400 font-bold uppercase">With Mutex Lock</div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">{raceResult.withLockFinalBalance}</div>
                  <div className="text-[10px] text-emerald-300 mt-1">Atomic operations preserved correctness.</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div className="text-xs text-slate-400 font-bold uppercase">Expected Balance</div>
                  <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{raceResult.expectedBalance}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Critical Section Algorithms */}
      {activeSubTab === 'cs' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Critical Section Solution Algorithms</h3>
            <div className="flex gap-2">
              <button onClick={() => handleRunCS('PETERSON')} className="px-3 py-1.5 bg-slate-800 text-cyan-400 text-xs rounded-lg font-semibold border border-slate-700">Peterson's</button>
              <button onClick={() => handleRunCS('TEST_AND_SET')} className="px-3 py-1.5 bg-slate-800 text-cyan-400 text-xs rounded-lg font-semibold border border-slate-700">Test-and-Set</button>
              <button onClick={() => handleRunCS('SEMAPHORE')} className="px-3 py-1.5 bg-slate-800 text-cyan-400 text-xs rounded-lg font-semibold border border-slate-700">Semaphore</button>
            </div>
          </div>

          <div className="space-y-2">
            {csResult.map(step => (
              <div key={step.step} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono flex items-center justify-between">
                <div>
                  <span className="text-cyan-400 font-bold">Step {step.step}: </span>
                  <span className="text-slate-200">{step.log}</span>
                </div>
                {step.processInCS && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    CS: {step.processInCS}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Producer Consumer */}
      {activeSubTab === 'producer' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Bounded Buffer (Producer-Consumer)</h3>
            <button onClick={handleRunProducer} className="px-4 py-1.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg">Run Bounded Buffer</button>
          </div>

          <div className="space-y-3">
            {bufferResult.map(step => (
              <div key={step.step} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400">Step {step.step}: {step.action}</span>
                  <span className="font-mono text-slate-400">Mutex: {step.mutexState ? 'Unlocked' : 'Locked'} | Empty: {step.emptySem} | Full: {step.fullSem}</span>
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: step.bufferSize }).map((_, i) => (
                    <div key={i} className={`w-16 h-10 rounded-lg border flex items-center justify-center font-mono text-[10px] ${
                      step.buffer[i] ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-600'
                    }`}>
                      {step.buffer[i] || 'EMPTY'}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Dining Philosophers */}
      {activeSubTab === 'philosophers' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Dining Philosophers Problem</h3>
            <button onClick={handleRunPhilosophers} className="px-4 py-1.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg">Simulate Round Table</button>
          </div>

          <div className="space-y-3">
            {philsResult.map(step => (
              <div key={step.step} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-cyan-400">Step {step.step}: {step.log}</div>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  {step.philosophers.map((p: any) => (
                    <div key={p.id} className={`p-2 rounded-xl border ${
                      p.state === 'EATING' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold' : p.state === 'HUNGRY' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      <div>Phil {p.id}</div>
                      <div className="text-[10px] mt-1 font-mono">{p.state}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Readers Writers */}
      {activeSubTab === 'rw' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Readers-Writers Problem</h3>
            <button onClick={handleRunRW} className="px-4 py-1.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg">Simulate Access</button>
          </div>

          <div className="space-y-2">
            {rwResult.map(step => (
              <div key={step.step} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                <span className="text-cyan-400 font-bold">Step {step.step}: </span>
                <span className="text-slate-200">{step.log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Sleeping Barber */}
      {activeSubTab === 'barber' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Sleeping Barber Problem</h3>
            <button onClick={handleRunBarber} className="px-4 py-1.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg">Simulate Waiting Room</button>
          </div>

          <div className="space-y-2">
            {barberResult.map(step => (
              <div key={step.step} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                <span className="text-cyan-400 font-bold">Step {step.step}: </span>
                <span className="text-slate-200">{step.log}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
