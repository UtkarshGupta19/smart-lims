import React, { useEffect, useState } from 'react';
import { runLinuxMonitorScript, fetchModernConcepts } from '../services/api';
import { Terminal, Cpu, HardDrive } from 'lucide-react';

export const LogsPage: React.FC = () => {
  const [selectedScript, setSelectedScript] = useState<string>('health_check.sh');
  const [terminalOutput, setTerminalOutput] = useState<string>('Select a Linux monitoring script to execute...');
  const [loading, setLoading] = useState<boolean>(false);
  const [modernSpecs, setModernSpecs] = useState<any>(null);

  useEffect(() => {
    loadSpecs();
    handleRunScript('health_check.sh');
  }, []);

  const loadSpecs = async () => {
    try {
      const data = await fetchModernConcepts();
      setModernSpecs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunScript = async (script: string) => {
    setSelectedScript(script);
    setLoading(true);
    try {
      const res = await runLinuxMonitorScript(script);
      setTerminalOutput(res.output || res.error || 'No output received.');
    } catch (err: any) {
      setTerminalOutput(`Execution Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Terminal className="w-6 h-6 text-cyan-400" />
          <span>OS System Monitoring & Safe Linux CLI Terminal</span>
        </h2>
        <p className="text-xs text-slate-400">Execute Safe Linux Monitoring Shell Scripts & Inspect Hypervisor / GPU CUDA Metrics</p>
      </div>

      {/* Script Selector Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'health_check.sh', label: 'Health Check' },
          { id: 'cpu_monitoring.sh', label: 'CPU Load' },
          { id: 'memory_monitoring.sh', label: 'Memory Stats' },
          { id: 'disk_monitoring.sh', label: 'Disk Space' },
          { id: 'process_monitoring.sh', label: 'Process Audit' },
          { id: 'user_management.sh', label: 'User Audit' },
          { id: 'backup.sh', label: 'DB Backup' },
        ].map(sc => (
          <button
            key={sc.id}
            onClick={() => handleRunScript(sc.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              selectedScript === sc.id
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {sc.label}
          </button>
        ))}
      </div>

      {/* Terminal View */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 font-bold text-slate-300">bash ./scripts/{selectedScript}</span>
          </div>
          <span className="text-[10px] text-slate-500">{loading ? 'Executing...' : 'Exit code: 0'}</span>
        </div>

        <pre className="text-cyan-300 whitespace-pre-wrap overflow-x-auto min-h-[160px] max-h-[300px]">
          {terminalOutput}
        </pre>
      </div>

      {/* Modern OS Concepts: Virtual Machine & GPU CUDA */}
      {modernSpecs && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>Virtual Machine / Hypervisor Spec</span>
            </h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between"><span className="text-slate-400">Hypervisor:</span><span className="text-white">{modernSpecs.virtualMachine.hypervisorType}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">vCPUs:</span><span className="text-cyan-400 font-bold">{modernSpecs.virtualMachine.virtualCpus} cores</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Allocated RAM:</span><span className="text-emerald-400 font-bold">{modernSpecs.virtualMachine.allocatedRamGB} GB</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Guest OS:</span><span className="text-slate-200">{modernSpecs.virtualMachine.guestOs}</span></div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>GPU / CUDA Parallel Computing Engine</span>
            </h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between"><span className="text-slate-400">GPU Model:</span><span className="text-white">{modernSpecs.gpuAcceleration.gpuModel}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">CUDA Cores:</span><span className="text-cyan-400 font-bold">{modernSpecs.gpuAcceleration.cudaCores}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">VRAM:</span><span className="text-emerald-400 font-bold">{modernSpecs.gpuAcceleration.vramGB} GB GDDR6X</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Active Streams:</span><span className="text-amber-400 font-bold">{modernSpecs.gpuAcceleration.activeCudaStreams} CUDA Streams</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
