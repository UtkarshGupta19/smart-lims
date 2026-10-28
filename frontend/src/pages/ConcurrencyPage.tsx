import React, { useState } from 'react';
import {
  runBookingRace,
  runRaceConditionSim,
  runCriticalSectionAlgo,
  runBoundedBuffer,
  runDiningPhilosophers,
  runReadersWriters,
  runSleepingBarber,
} from '../services/api';
import { BookingRaceResult } from '../types';
import {
  Repeat,
  Play,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Layers,
  Users,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export const ConcurrencyPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'booking-race' | 'buffer' | 'cs-algos' | 'dining' | 'rw'>('booking-race');

  // Booking Race State
  const [targetWorkstation, setTargetWorkstation] = useState<string>('PC-01');
  const [bookingRaceResult, setBookingRaceResult] = useState<BookingRaceResult | null>(null);
  const [raceLoading, setRaceLoading] = useState<boolean>(false);

  // Other IPC simulation results
  const [bufferResult, setBufferResult] = useState<any[]>([]);
  const [csResult, setCsResult] = useState<any[]>([]);
  const [philsResult, setPhilsResult] = useState<any[]>([]);
  const [rwResult, setRwResult] = useState<any[]>([]);

  const handleRunBookingRace = async () => {
    setRaceLoading(true);
    try {
      const res = await runBookingRace(targetWorkstation, targetWorkstation === 'PC-01' ? 'Workstation Alpha' : 'Workstation Beta');
      setBookingRaceResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setRaceLoading(false);
    }
  };

  const handleRunBuffer = async () => {
    setBufferResult(await runBoundedBuffer(4, 6));
  };

  const handleRunCS = async (algo: string) => {
    setCsResult(await runCriticalSectionAlgo(algo));
  };

  const handleRunDining = async () => {
    setPhilsResult(await runDiningPhilosophers());
  };

  const handleRunRW = async () => {
    setRwResult(await runReadersWriters());
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Repeat className="w-5 h-5 text-blue-600" />
            <span>Threads, Concurrency & Synchronization Laboratory</span>
          </h2>
          <p className="text-xs text-slate-500">
            Critical section mutual exclusion, race condition reproduction, mutex locks & bounded buffer queues
          </p>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        {[
          { id: 'booking-race', label: '1. Lab Booking Race vs Mutex' },
          { id: 'buffer', label: '2. Bounded Buffer (Producer-Consumer)' },
          { id: 'cs-algos', label: '3. Critical Section Algos' },
          { id: 'dining', label: '4. Dining Philosophers' },
          { id: 'rw', label: '5. Readers-Writers Mutex' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition ${
              activeSubTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Lab Booking Race vs Mutex */}
      {activeSubTab === 'booking-race' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Shared Workstation Booking Critical Section</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Simulate two concurrent student threads competing for the exact same computer workstation
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={targetWorkstation}
                  onChange={e => setTargetWorkstation(e.target.value)}
                  className="border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 bg-white"
                >
                  <option value="PC-01">PC-01 (Workstation Alpha)</option>
                  <option value="PC-02">PC-02 (Workstation Beta)</option>
                  <option value="PC-03">PC-03 (Workstation Gamma)</option>
                </select>

                <button
                  onClick={handleRunBookingRace}
                  disabled={raceLoading}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{raceLoading ? 'Simulating...' : 'Simulate Contention'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <strong>Educational Principle: </strong>
              In computer laboratories, concurrent student reservations accessing a shared resource table without synchronization can interleave. Both read the resource as available, and both commit allocations, resulting in <em>double booking</em>. With a Mutex lock, access to the critical section is serialized so only one booking succeeds.
            </div>

            {bookingRaceResult && (
              <div className="space-y-6 pt-2">
                {/* Comparison Header Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Unsynchronized Card */}
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-800 uppercase flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Scenario A: Without Mutex Lock</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900">
                        RACE BUG REPRODUCED
                      </span>
                    </div>
                    <div className="text-xs text-rose-900 font-medium">
                      Outcome: <strong>Double booking occurred!</strong> Both students received confirmations for {bookingRaceResult.resourceId}.
                    </div>
                    <div className="text-[11px] font-mono text-rose-800">
                      Granted to: {bookingRaceResult.unsynchronized.grantedBookings.join(' AND ')}
                    </div>
                    <div className="text-[11px] text-rose-700 italic border-t border-rose-200 pt-1">
                      {bookingRaceResult.unsynchronized.summary}
                    </div>
                  </div>

                  {/* Synchronized Card */}
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Scenario B: With Mutex Synchronization</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">
                        MUTUAL EXCLUSION PROVEN
                      </span>
                    </div>
                    <div className="text-xs text-emerald-900 font-medium">
                      Outcome: <strong>Exactly 1 reservation confirmed.</strong> Second request rejected safely.
                    </div>
                    <div className="text-[11px] font-mono text-emerald-800">
                      Granted Owner: <strong>{bookingRaceResult.synchronized.finalOwner}</strong>
                    </div>
                    <div className="text-[11px] text-emerald-700 italic border-t border-emerald-200 pt-1">
                      {bookingRaceResult.synchronized.summary}
                    </div>
                  </div>
                </div>

                {/* Step Traces Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Unsynchronized Trace */}
                  <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Unsynchronized Interleaving Trace
                    </h4>
                    <div className="space-y-2 text-xs">
                      {bookingRaceResult.unsynchronized.steps.map(st => (
                        <div key={st.step} className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between font-mono text-[10px]">
                            <span className="font-bold text-slate-700">Step {st.step}: {st.threadId}</span>
                            <span className="text-rose-600 font-bold">Lock: None</span>
                          </div>
                          <div className="text-slate-800 font-sans text-[11px]">{st.action}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Resource State: <strong className="text-slate-700">{st.resourceStatus}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Synchronized Trace */}
                  <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Synchronized (Mutex Protected) Trace
                    </h4>
                    <div className="space-y-2 text-xs">
                      {bookingRaceResult.synchronized.steps.map(st => (
                        <div key={st.step} className="p-2.5 rounded bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between font-mono text-[10px]">
                            <span className="font-bold text-slate-700">Step {st.step}: {st.threadId}</span>
                            <span className={`font-bold ${st.lockHeld ? 'text-blue-700' : 'text-slate-400'}`}>
                              {st.lockHeld ? '🔒 Mutex Held' : '🔓 Mutex Free'}
                            </span>
                          </div>
                          <div className="text-slate-800 font-sans text-[11px]">{st.action}</div>
                          {st.waitingQueue && st.waitingQueue.length > 0 && (
                            <div className="text-[10px] text-amber-700 font-mono bg-amber-50 p-1 rounded">
                              Waiting Queue: [{st.waitingQueue.join(', ')}]
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Bounded Buffer (Producer-Consumer) */}
      {activeSubTab === 'buffer' && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Bounded Buffer (Producer–Consumer with Semaphores)
              </h3>
              <p className="text-xs text-slate-500">
                Fixed capacity circular request queue protected by empty/full counting semaphores and a binary mutex
              </p>
            </div>
            <button
              onClick={handleRunBuffer}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Producer-Consumer Step Trace</span>
            </button>
          </div>

          {bufferResult.length > 0 && (
            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {bufferResult.map(step => (
                  <div key={step.step} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-blue-700">Step {step.step}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        step.action === 'PRODUCE' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {step.action}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-700">
                      <div>Buffer Slots: [{step.buffer.join(', ') || 'Empty'}]</div>
                      <div>In: {step.inIndex} | Out: {step.outIndex}</div>
                      <div>Semaphores: empty={step.emptySem}, full={step.fullSem}, mutex={step.mutexState ? 0 : 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Critical Section Algos */}
      {activeSubTab === 'cs-algos' && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Software & Hardware Critical Section Algorithms
              </h3>
              <p className="text-xs text-slate-500">
                Peterson's Solution, Test-and-Set Lock, and Counting Semaphores
              </p>
            </div>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => handleRunCS('PETERSON')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold border border-slate-300"
              >
                Peterson's
              </button>
              <button
                onClick={() => handleRunCS('TEST_AND_SET')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold border border-slate-300"
              >
                Test-and-Set
              </button>
              <button
                onClick={() => handleRunCS('SEMAPHORE')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold border border-slate-300"
              >
                Semaphore
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {csResult.map(step => (
              <div key={step.step} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs flex items-center justify-between font-mono">
                <div>
                  <span className="font-bold text-blue-700">Step {step.step}: </span>
                  <span className="text-slate-800 font-sans">{step.log}</span>
                </div>
                {step.processInCS && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                    CS: {step.processInCS}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Dining Philosophers */}
      {activeSubTab === 'dining' && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dining Philosophers Problem</h3>
              <p className="text-xs text-slate-500">Resource allocation and circular deadlock avoidance at a shared round table</p>
            </div>
            <button
              onClick={handleRunDining}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
            >
              Run Philosophers Simulation
            </button>
          </div>

          <div className="space-y-2">
            {philsResult.map(step => (
              <div key={step.step} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs font-mono">
                <span className="font-bold text-blue-700">Step {step.step}: </span>
                <span className="text-slate-800 font-sans">{step.log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Readers-Writers */}
      {activeSubTab === 'rw' && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Readers–Writers Problem</h3>
              <p className="text-xs text-slate-500">Concurrent readers allowed, exclusive writer access enforced</p>
            </div>
            <button
              onClick={handleRunRW}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
            >
              Run Readers-Writers Trace
            </button>
          </div>

          <div className="space-y-2">
            {rwResult.map(step => (
              <div key={step.step} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs font-mono">
                <span className="font-bold text-blue-700">Step {step.step}: </span>
                <span className="text-slate-800 font-sans">{step.log}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
