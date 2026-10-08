import React, { useEffect, useState } from 'react';
import { LabMachine, SoftwareLicense } from '../types';
import { fetchMachines, fetchLicenses, requestResource } from '../services/api';
import { Server, Key, Send, CheckCircle2, XCircle } from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const [machines, setMachines] = useState<LabMachine[]>([]);
  const [licenses, setLicenses] = useState<SoftwareLicense[]>([]);
  const [pid, setPid] = useState<string>('P101');
  const [selectedMachine, setSelectedMachine] = useState<string>('PC-01');
  const [selectedLicense, setSelectedLicense] = useState<string>('LIC-MATLAB');
  const [requestResult, setRequestResult] = useState<any>(null);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const [m, l] = await Promise.all([fetchMachines(), fetchLicenses()]);
      setMachines(m);
      setLicenses(l);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await requestResource(pid, selectedMachine, selectedLicense);
      setRequestResult(res);
      loadResources();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Server className="w-6 h-6 text-cyan-400" />
          <span>Laboratory Resource Management & Allocation Pipeline</span>
        </h2>
        <p className="text-xs text-slate-400">Machine Workstations, Software Licenses & Banker Safety Verified Allocations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Form */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Send className="w-4 h-4 text-cyan-400" />
            <span>Request Resource Allocation</span>
          </h3>

          <form onSubmit={handleRequest} className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 font-medium">Process PID</label>
              <input
                type="text"
                value={pid}
                onChange={e => setPid(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium">Lab Machine</label>
              <select
                value={selectedMachine}
                onChange={e => setSelectedMachine(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                {machines.map(m => (
                  <option key={m.id} value={m.id}>{m.id} - {m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium">Software License</label>
              <select
                value={selectedLicense}
                onChange={e => setSelectedLicense(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                {licenses.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.availableLicenses} available)</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg text-xs"
            >
              Submit Allocation Request
            </button>
          </form>

          {requestResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
              requestResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {requestResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" /> : <XCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />}
              <div>
                <strong>{requestResult.success ? 'Allocation Granted' : 'Request Rejected'}</strong>
                <div className="mt-0.5">{requestResult.reason}</div>
              </div>
            </div>
          )}
        </div>

        {/* Software Licenses Directory */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Software Licenses Status</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {licenses.map(l => (
                <div key={l.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white">{l.name}</span>
                    <span className="text-cyan-400 font-mono">{l.availableLicenses} / {l.totalLicenses} free</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full" style={{ width: `${(l.allocatedLicenses / l.totalLicenses) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
